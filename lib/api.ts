import type {
  LoginInput,
  LoginResponse,
  RegistroAspiranteInput,
  Aspirante,
} from "@/types/aspirante";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
  } catch {
    // el cuerpo no era JSON, se usa el mensaje por defecto
  }
  return fallback;
}

export async function registrarAspirante(
  data: RegistroAspiranteInput
): Promise<Aspirante> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/aspirantes/registro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo."
    );
  }

  if (res.status === 409) {
    throw new Error("Este correo electrónico ya está registrado.");
  }

  if (!res.ok) {
    const mensaje = await parseErrorMessage(
      res,
      "No se pudo completar el registro. Verifica los datos e intenta de nuevo."
    );
    throw new Error(mensaje);
  }

  return res.json();
}

export async function iniciarSesion(
  data: LoginInput
): Promise<LoginResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/aspirantes/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo."
    );
  }

  if (res.status === 401 || res.status === 500) {
    throw new Error("Correo electrónico o contraseña incorrectos.");
  }

  if (!res.ok) {
    const mensaje = await parseErrorMessage(
      res,
      "No se pudo iniciar sesión. Intenta de nuevo."
    );
    throw new Error(mensaje);
  }

  return res.json();
}
