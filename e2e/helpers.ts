import { APIRequestContext, expect, Page } from "@playwright/test";
import path from "node:path";

export const API_URL = (
  process.env.E2E_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/+$/, "");

export const FIXTURES = {
  documento: path.join(__dirname, "fixtures", "documento-identidad.pdf"),
  foto: path.join(__dirname, "fixtures", "foto-3x4.png"),
};

export const CONTRASENA_PRUEBA = "ClaveE2E-2027";

export function correoUnico(prefijo: string) {
  return `${prefijo}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@e2e.unac.test`;
}

export function credencialesAdmin() {
  const correo = process.env.E2E_ADMIN_EMAIL;
  const contrasena = process.env.E2E_ADMIN_PASSWORD;
  if (!correo || !contrasena) {
    throw new Error(
      "Define E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD con la cuenta semilla del backend (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD)."
    );
  }
  return { correo, contrasena };
}

export async function iniciarSesionUI(page: Page, correo: string, contrasena: string) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(correo);
  await page.getByLabel("Contraseña", { exact: true }).fill(contrasena);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

/** Token guardado por el frontend tras el login (único dato de sesión en el cliente). */
export async function tokenDeLaPagina(page: Page) {
  const token = await page.evaluate(() => localStorage.getItem("unac_token"));
  expect(token, "el frontend debe guardar el JWT tras el login").toBeTruthy();
  return token as string;
}

/** Crea un aspirante con inscripción en estado PENDIENTE directamente contra la API. */
export async function crearAspiranteConInscripcionPendiente(request: APIRequestContext) {
  const correo = correoUnico("pendiente");
  const registro = await request.post(`${API_URL}/api/aspirantes/registro`, {
    data: { nombres: "Pendiente", apellidos: "E2E", correoElectronico: correo, contrasena: CONTRASENA_PRUEBA },
  });
  expect(registro.ok(), await registro.text()).toBeTruthy();

  const login = await request.post(`${API_URL}/api/aspirantes/login`, {
    data: { correoElectronico: correo, contrasena: CONTRASENA_PRUEBA },
  });
  expect(login.ok(), await login.text()).toBeTruthy();
  const { token } = await login.json();

  const inscripcion = await request.post(`${API_URL}/api/inscripciones`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      cumpleTituloBachiller: true,
      cumpleIcfes: true,
      tipoDocumento: "CEDULA_CIUDADANIA",
      numeroDocumento: String(Date.now()).slice(-10),
      fechaNacimiento: "2007-05-20",
      genero: "OTRO",
      telefono: "3001234567",
      ciudadResidencia: "Medellín",
      institucionBachillerato: "Colegio E2E",
      municipioColegio: "Medellín",
      anioGraduacion: 2025,
      codigoResultadoIcfes: "AC2025000000",
      puntajeGlobalIcfes: 320,
      facultad: "Facultad de Ingeniería",
      programa: "Ingeniería de Sistemas",
      semestre: "2027-1",
    },
  });
  expect(inscripcion.status(), await inscripcion.text()).toBe(201);
  const { numeroInscripcion } = await inscripcion.json();
  return { correo, numeroInscripcion: numeroInscripcion as string };
}
