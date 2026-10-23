import { useMemo, useSyncExternalStore } from "react";
import type { RolPersonal, Sesion } from "@/types/auth";

// El único dato de sesión que se guarda en el cliente es el JWT del backend.
const TOKEN_KEY = "unac_token";
const EVENTO_SESION = "unac:sesion";

export const RUTA_POR_ROL: Record<RolPersonal, string> = {
  ADMISIONES: "/admin/admisiones",
  TESORERIA: "/admin/tesoreria",
  EVALUACION: "/admin/evaluacion",
};

function leerStorage(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function notificarCambio() {
  window.dispatchEvent(new Event(EVENTO_SESION));
}

export function guardarToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // almacenamiento bloqueado: la sesión solo vivirá en esta pestaña
  }
  notificarCambio();
}

export function cerrarSesion() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nada que limpiar
  }
  notificarCambio();
}

function decodificarBase64Url(segmento: string): string {
  const base64 = segmento.replace(/-/g, "+").replace(/_/g, "/");
  const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binario = atob(relleno);
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/**
 * Lee los claims del JWT. No verifica la firma (eso lo hace el backend en cada
 * petición); solo sirve para decidir qué mostrar y a dónde redirigir.
 */
export function decodificarSesion(token: string): Sesion | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const claims = JSON.parse(decodificarBase64Url(payload));
    const id = Number(claims.sub);
    const expira = Number(claims.exp) * 1000;
    if (!Number.isFinite(id) || !Number.isFinite(expira)) return null;

    if (claims.tipo === "ASPIRANTE") {
      return { tipo: "ASPIRANTE", id, correo: String(claims.correo ?? ""), expira };
    }
    if (claims.tipo === "PERSONAL" && claims.rol in RUTA_POR_ROL) {
      return {
        tipo: "PERSONAL",
        id,
        correo: String(claims.correo ?? ""),
        rol: claims.rol as RolPersonal,
        expira,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Token guardado, solo si sigue vigente. */
export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = leerStorage();
  if (!token) return null;
  const sesion = decodificarSesion(token);
  return sesion && sesion.expira > Date.now() ? token : null;
}

function suscribir(onCambio: () => void) {
  window.addEventListener(EVENTO_SESION, onCambio);
  window.addEventListener("storage", onCambio);
  return () => {
    window.removeEventListener(EVENTO_SESION, onCambio);
    window.removeEventListener("storage", onCambio);
  };
}

/**
 * Sesión actual a partir del JWT.
 * - `undefined`: todavía hidratando (no se sabe en el servidor).
 * - `null`: sin sesión o token vencido.
 */
export function useSesion(): Sesion | null | undefined {
  const token = useSyncExternalStore<string | null | undefined>(
    suscribir,
    obtenerToken,
    () => undefined
  );
  return useMemo(() => {
    if (token === undefined) return undefined;
    return token ? decodificarSesion(token) : null;
  }, [token]);
}

/** Evita redirecciones abiertas: solo rutas internas. */
export function rutaInternaSegura(ruta: string | null): string | null {
  if (!ruta || !ruta.startsWith("/") || ruta.startsWith("//") || ruta.startsWith("/\\")) {
    return null;
  }
  return ruta;
}
