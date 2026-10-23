import type {
  Aspirante,
  LoginInput,
  LoginResponse,
  RegistroAspiranteInput,
} from "@/types/aspirante";
import type {
  LoginPersonalResponse,
  PersonalAdministrativo,
  RegistroPersonalInput,
  RolPersonal,
} from "@/types/auth";
import type {
  CrearInscripcionInput,
  EstadoInscripcion,
  Inscripcion,
  InscripcionDetalle,
  InscripcionPendiente,
  RegistrarPagoInput,
} from "@/types/inscripcion";
import { cerrarSesion, obtenerToken } from "@/lib/auth";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const MENSAJE_SIN_CONEXION =
  "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.";
const MENSAJE_ERROR_SERVIDOR =
  "El servidor tuvo un problema al procesar la solicitud. Intenta de nuevo en unos minutos.";

/** Error de la API con el código HTTP real (0 = sin conexión). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** El backend responde los errores como texto plano; se acepta también JSON. */
async function leerMensajeError(res: Response): Promise<string | null> {
  let cuerpo: string;
  try {
    cuerpo = (await res.text()).trim();
  } catch {
    return null;
  }
  if (!cuerpo) return null;
  try {
    const data = JSON.parse(cuerpo);
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
    return null;
  } catch {
    // texto plano; se descarta si parece una página HTML o un volcado largo
    return cuerpo.startsWith("<") || cuerpo.length > 300 ? null : cuerpo;
  }
}

interface OpcionesPeticion {
  method?: "GET" | "POST";
  json?: unknown;
  formData?: FormData;
  autenticada?: boolean;
}

async function peticion(ruta: string, opciones: OpcionesPeticion = {}): Promise<Response> {
  const { method = "GET", json, formData, autenticada = false } = opciones;
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  } else if (formData) {
    // el navegador pone el Content-Type multipart con su boundary
    body = formData;
  }

  if (autenticada) {
    const token = obtenerToken();
    if (!token) {
      cerrarSesion();
      throw new ApiError(401, "Tu sesión expiró. Inicia sesión de nuevo.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${ruta}`, { method, headers, body });
  } catch {
    throw new ApiError(0, MENSAJE_SIN_CONEXION);
  }

  if (autenticada && res.status === 401) {
    cerrarSesion();
    throw new ApiError(401, "Tu sesión expiró. Inicia sesión de nuevo.");
  }
  return res;
}

/** Convierte una respuesta no exitosa en ApiError con un mensaje adecuado. */
async function fallar(res: Response, mensajes: Partial<Record<number, string>> = {}): Promise<never> {
  const delServidor = await leerMensajeError(res);
  if (res.status >= 500 && !mensajes[res.status]) {
    throw new ApiError(res.status, MENSAJE_ERROR_SERVIDOR);
  }
  const porDefecto =
    res.status === 403
      ? "No tienes permiso para realizar esta acción."
      : "No se pudo completar la solicitud. Verifica los datos e intenta de nuevo.";
  throw new ApiError(res.status, mensajes[res.status] ?? delServidor ?? porDefecto);
}

// ---------- Aspirante ----------

export async function registrarAspirante(data: RegistroAspiranteInput): Promise<Aspirante> {
  const res = await peticion("/api/aspirantes/registro", { method: "POST", json: data });
  if (!res.ok) await fallar(res, { 409: "Este correo electrónico ya está registrado." });
  return res.json();
}

// ---------- Login unificado ----------

export type ResultadoLogin =
  | { tipo: "ASPIRANTE"; token: string }
  | { tipo: "PERSONAL"; token: string; rol: RolPersonal };

const MENSAJE_CREDENCIALES = "Correo electrónico o contraseña incorrectos.";

/**
 * Intenta primero el login de aspirante y, si el backend rechaza las
 * credenciales (401), el de personal administrativo. Un error de servidor o de
 * red se reporta como tal, nunca como "credenciales incorrectas".
 */
export async function iniciarSesion(data: LoginInput): Promise<ResultadoLogin> {
  const resAspirante = await peticion("/api/aspirantes/login", { method: "POST", json: data });
  if (resAspirante.ok) {
    const { token } = (await resAspirante.json()) as LoginResponse;
    return { tipo: "ASPIRANTE", token };
  }
  if (resAspirante.status !== 401) await fallar(resAspirante);

  const resPersonal = await peticion("/api/personal/login", { method: "POST", json: data });
  if (resPersonal.ok) {
    const { token, rol } = (await resPersonal.json()) as LoginPersonalResponse;
    return { tipo: "PERSONAL", token, rol };
  }
  return fallar(resPersonal, { 401: MENSAJE_CREDENCIALES, 403: MENSAJE_CREDENCIALES });
}

// ---------- Inscripción del aspirante ----------

export async function crearInscripcion(data: CrearInscripcionInput): Promise<Inscripcion> {
  const res = await peticion("/api/inscripciones", { method: "POST", json: data, autenticada: true });
  if (!res.ok) {
    await fallar(res, {
      403: "No cumples los requisitos mínimos para inscribirte.",
      409: "Ya tienes una inscripción activa.",
    });
  }
  return res.json();
}

export async function adjuntarDocumentos(
  documentoIdentidad: File,
  foto: File
): Promise<Inscripcion> {
  const formData = new FormData();
  formData.append("documentoIdentidad", documentoIdentidad);
  formData.append("foto", foto);

  const res = await peticion("/api/inscripciones/documentos", {
    method: "POST",
    formData,
    autenticada: true,
  });
  if (!res.ok) {
    const delServidor = await leerMensajeError(res.clone());
    await fallar(res, {
      422:
        "Uno de los archivos fue rechazado por el antivirus por considerarse inseguro y no se guardó. " +
        "Revisa tus archivos y súbelos de nuevo." +
        (delServidor ? ` (${delServidor})` : ""),
      503:
        "El servicio de antivirus no está disponible en este momento, así que no pudimos validar tus archivos. " +
        "Intenta de nuevo en unos minutos.",
      404: "No encontramos tu inscripción. Completa primero el formulario.",
    });
  }
  return res.json();
}

export async function registrarPago(data: RegistrarPagoInput): Promise<Inscripcion> {
  const res = await peticion("/api/inscripciones/pago", { method: "POST", json: data, autenticada: true });
  if (!res.ok) {
    await fallar(res, {
      409: "Debes adjuntar el documento de identidad y la foto antes de registrar el pago.",
      404: "No encontramos tu inscripción. Completa primero el formulario.",
    });
  }
  return res.json();
}

/** Estado de la inscripción del aspirante autenticado; `null` si aún no tiene. */
export async function consultarMiEstado(): Promise<EstadoInscripcion | null> {
  const res = await peticion("/api/inscripciones/mi-estado", { autenticada: true });
  if (res.status === 404) return null;
  if (!res.ok) await fallar(res);
  return res.json();
}

// ---------- Personal administrativo ----------

export async function listarInscripcionesPendientes(): Promise<InscripcionPendiente[]> {
  const res = await peticion("/api/admin/inscripciones/pendientes", { autenticada: true });
  if (!res.ok) await fallar(res);
  return res.json();
}

/** Detalle completo de una inscripción (Admisiones, Tesorería, Evaluación). */
export async function obtenerDetalleInscripcion(inscripcionId: number): Promise<InscripcionDetalle> {
  const res = await peticion(`/api/admin/inscripciones/${inscripcionId}`, { autenticada: true });
  if (!res.ok) await fallar(res, { 404: "No encontramos esa inscripción." });
  return res.json();
}

/** Tesorería aprueba o rechaza la referencia de pago de una inscripción en EN_REVISION. */
export async function validarPago(
  inscripcionId: number,
  aprobado: boolean,
  observacion?: string
): Promise<Inscripcion> {
  const res = await peticion(`/api/tesoreria/inscripciones/${inscripcionId}/validar-pago`, {
    method: "POST",
    json: { aprobado, observacion: observacion || undefined },
    autenticada: true,
  });
  if (!res.ok) {
    await fallar(res, {
      409: "Esta inscripción ya no está pendiente de validación de pago.",
      404: "No encontramos esa inscripción.",
    });
  }
  return res.json();
}

/** Evaluación aprueba o rechaza una inscripción que ya fue enviada (ENVIADO). */
export async function evaluarInscripcion(
  inscripcionId: number,
  decision: "APROBADO" | "RECHAZADO",
  observacion?: string
): Promise<Inscripcion> {
  const res = await peticion(`/api/evaluacion/inscripciones/${inscripcionId}/evaluar`, {
    method: "POST",
    json: { decision, observacion: observacion || undefined },
    autenticada: true,
  });
  if (!res.ok) {
    await fallar(res, {
      409: "Esta inscripción ya no está lista para evaluación.",
      404: "No encontramos esa inscripción.",
    });
  }
  return res.json();
}

export async function registrarPersonal(
  data: RegistroPersonalInput
): Promise<PersonalAdministrativo> {
  const res = await peticion("/api/personal/registro", { method: "POST", json: data, autenticada: true });
  if (!res.ok) {
    await fallar(res, {
      409: "Este correo electrónico ya está registrado.",
      403: "Solo el personal de Admisiones puede registrar nuevo personal.",
    });
  }
  return res.json();
}
