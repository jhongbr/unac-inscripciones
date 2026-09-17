import type { AreaAdministrativa, SesionAdmin } from "@/types/auth";

const TOKEN_KEY = "unac_token";
const CUENTAS_ADMIN_KEY = "unac_cuentas_admin";
const SESION_ADMIN_KEY = "unac_sesion_admin";

export function guardarToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function obtenerToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function cerrarSesion() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

interface CuentaAdmin {
  contrasena: string;
  area: AreaAdministrativa;
}

function obtenerCuentasAdmin(): Record<string, CuentaAdmin> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CUENTAS_ADMIN_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function registrarCuentaAdmin(
  correoElectronico: string,
  contrasena: string,
  area: AreaAdministrativa
) {
  if (typeof window === "undefined") return;
  const cuentas = obtenerCuentasAdmin();
  cuentas[correoElectronico.trim().toLowerCase()] = { contrasena, area };
  localStorage.setItem(CUENTAS_ADMIN_KEY, JSON.stringify(cuentas));
}

export function iniciarSesionAdmin(
  correoElectronico: string,
  contrasena: string
): AreaAdministrativa | null {
  const correo = correoElectronico.trim().toLowerCase();
  const cuenta = obtenerCuentasAdmin()[correo];
  if (!cuenta || cuenta.contrasena !== contrasena) return null;

  if (typeof window !== "undefined") {
    const sesion: SesionAdmin = { correoElectronico: correo, area: cuenta.area };
    localStorage.setItem(SESION_ADMIN_KEY, JSON.stringify(sesion));
  }
  return cuenta.area;
}

export function obtenerSesionAdmin(): SesionAdmin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESION_ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function cerrarSesionAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESION_ADMIN_KEY);
}
