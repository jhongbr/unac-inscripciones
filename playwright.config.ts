import { defineConfig, devices } from "@playwright/test";

// Las pruebas corren contra el stack real ya levantado (frontend + backend +
// PostgreSQL + ClamAV). No se levanta ningún servicio desde aquí.
// Variables:
//   E2E_BASE_URL        frontend (por defecto http://localhost:3000)
//   E2E_API_URL         backend  (por defecto NEXT_PUBLIC_API_URL o http://localhost:8080)
//   E2E_ADMIN_EMAIL     cuenta semilla de ADMISIONES (= ADMIN_SEED_EMAIL del backend)
//   E2E_ADMIN_PASSWORD  contraseña semilla          (= ADMIN_SEED_PASSWORD del backend)
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
