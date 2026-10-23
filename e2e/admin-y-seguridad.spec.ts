import { expect, test } from "@playwright/test";
import {
  credencialesAdmin,
  crearAspiranteConInscripcionPendiente,
  iniciarSesionUI,
} from "./helpers";

test("personal de Admisiones (cuenta semilla) ve la lista real de inscripciones pendientes", async ({
  page,
  request,
}) => {
  // El backend solo lista inscripciones en estado PENDIENTE (sin pago), así que
  // se crea una real vía API para tener un dato conocido en la lista.
  const { correo, numeroInscripcion } = await crearAspiranteConInscripcionPendiente(request);
  const admin = credencialesAdmin();

  await iniciarSesionUI(page, admin.correo, admin.contrasena);
  await expect(page).toHaveURL(/\/admin\/admisiones$/);

  const fila = page.getByTestId("fila-inscripcion").filter({ hasText: numeroInscripcion });
  await expect(fila).toBeVisible();
  await expect(fila).toContainText(correo);

  // el menú solo muestra las secciones de su rol
  const nav = page.getByRole("navigation");
  await expect(nav.getByRole("link", { name: "Admisiones" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Tesorería" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Evaluación" })).toHaveCount(0);
});

test("sin sesión, /inscripcion/documentos redirige a login", async ({ page }) => {
  await page.goto("/inscripcion/documentos");
  await expect(page).toHaveURL(/\/login\?next=%2Finscripcion%2Fdocumentos$/);
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});

test("el registro público no ofrece crear cuentas de personal administrativo", async ({ page }) => {
  await page.goto("/registro");
  await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeVisible();

  const formulario = page.locator("form");
  await expect(page.getByText(/administrativ/i)).toHaveCount(0);
  await expect(page.getByLabel(/administrativ/i)).toHaveCount(0);
  await expect(page.getByRole("radio")).toHaveCount(0);
  for (const rol of [/admisiones/i, /tesorer/i, /evaluaci/i]) {
    await expect(formulario.getByText(rol)).toHaveCount(0);
  }
  // solo queda la casilla de términos
  await expect(page.getByRole("checkbox")).toHaveCount(1);
});
