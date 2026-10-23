import { expect, test } from "@playwright/test";
import {
  API_URL,
  CONTRASENA_PRUEBA,
  correoUnico,
  FIXTURES,
  iniciarSesionUI,
  tokenDeLaPagina,
} from "./helpers";

test.describe.serial("Aspirante: registro, inscripción completa y consulta de estado", () => {
  const correo = correoUnico("aspirante");
  let numeroInscripcion = "";

  test("se registra, inicia sesión y completa todo el flujo hasta la confirmación", async ({ page }) => {
    // Registro
    await page.goto("/registro");
    await page.getByLabel("Nombres").fill("Ana");
    await page.getByLabel("Apellidos").fill("Prueba E2E");
    await page.getByLabel("Correo electrónico").fill(correo);
    await page.getByLabel("Contraseña", { exact: true }).fill(CONTRASENA_PRUEBA);
    await page.getByLabel("Confirmar contraseña").fill(CONTRASENA_PRUEBA);
    await page.getByLabel(/Acepto los términos/).check();
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page).toHaveURL(/\/login$/);

    // Login
    await iniciarSesionUI(page, correo, CONTRASENA_PRUEBA);
    await expect(page).toHaveURL(/\/inscripcion\/requisitos$/);

    // Paso 1: requisitos
    await page.getByRole("button", { name: "Sí" }).nth(0).click();
    await page.getByRole("button", { name: "Sí" }).nth(1).click();
    await page.getByLabel(/Confirmo que cumplo los requisitos/).check();
    await page.getByRole("button", { name: /Continuar al formulario/ }).click();
    await expect(page).toHaveURL(/\/inscripcion\/formulario$/);

    // Paso 2: formulario (POST /api/inscripciones)
    await page.getByLabel("Tipo de documento").selectOption("CEDULA_CIUDADANIA");
    await page.getByLabel("Número de documento").fill(String(Date.now()).slice(-10));
    await page.getByLabel("Fecha de nacimiento").fill("2007-03-15");
    await page.getByLabel("Género").selectOption("FEMENINO");
    await page.getByLabel("Teléfono").fill("3001234567");
    await page.getByLabel("Ciudad de residencia").fill("Medellín");
    await page.getByLabel("Institución de bachillerato").fill("Colegio E2E");
    await page.getByLabel("Municipio del colegio").fill("Medellín");
    await page.getByLabel("Año de graduación").fill("2025");
    await page.getByLabel("Código resultado ICFES").fill("AC2025123456");
    await page.getByLabel("Puntaje global Saber 11").fill("345");
    await page.getByLabel("Facultad").selectOption("Facultad de Ingeniería");
    await page.getByLabel("Programa", { exact: true }).selectOption("Ingeniería de Sistemas");
    await page.getByLabel("Semestre").selectOption({ index: 1 });
    await page.getByRole("button", { name: /Continuar a documentos/ }).click();
    await expect(page).toHaveURL(/\/inscripcion\/documentos$/);

    // Paso 3: documentos reales (multipart, escaneados por ClamAV)
    await page.locator("#documentoIdentidad").setInputFiles(FIXTURES.documento);
    await page.locator("#foto").setInputFiles(FIXTURES.foto);
    await page.getByRole("button", { name: /Subir y continuar al pago/ }).click();
    await expect(page).toHaveURL(/\/inscripcion\/pago$/, { timeout: 30_000 });

    // Paso 4: pago (POST /api/inscripciones/pago)
    await page.getByLabel("Referencia de pago").fill(`REF-${Date.now()}`);
    await page.getByLabel("Fecha de pago").fill("2026-10-10");
    await page.getByLabel("Banco").fill("Bancolombia");
    await page.getByLabel(/Confirmo que los datos de pago/).check();
    await page.getByRole("button", { name: /Confirmar inscripción/ }).click();

    // Confirmación con el número que asignó el backend
    await expect(page).toHaveURL(/\/inscripcion\/confirmacion$/);
    const numero = page.getByTestId("numero-inscripcion");
    await expect(numero).toHaveText(/^INS-\d+$/);
    numeroInscripcion = (await numero.textContent())!.trim();

    const token = await tokenDeLaPagina(page);
    const res = await page.request.get(`${API_URL}/api/inscripciones/mi-estado`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).numeroInscripcion).toBe(numeroInscripcion);
  });

  test("consulta el estado y ve el valor real que devuelve el backend", async ({ page }) => {
    expect(numeroInscripcion, "depende de la prueba anterior").not.toBe("");
    await iniciarSesionUI(page, correo, CONTRASENA_PRUEBA);
    await expect(page).toHaveURL(/\/inscripcion\//);

    await page.goto("/estado");
    const token = await tokenDeLaPagina(page);
    const res = await page.request.get(`${API_URL}/api/inscripciones/mi-estado`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBeTruthy();
    const estadoBackend = await res.json();

    await expect(page.getByTestId("estado-numero")).toHaveText(estadoBackend.numeroInscripcion);
    await expect(page.getByTestId("estado-numero")).toHaveText(numeroInscripcion);
    // tras registrar el pago el backend deja la inscripción "en revisión"
    expect(estadoBackend.estado).toBe("EN_REVISION");
    await expect(page.getByTestId("estado-badge")).toHaveText("En revisión");
  });
});
