# UNAC Inscripciones (frontend)

Portal de inscripciones y admisiones de la Corporación Universitaria Adventista. Los aspirantes crean su cuenta, completan la inscripción paso a paso y consultan su estado. El personal administrativo gestiona las solicitudes según su rol.

Este repositorio contiene solo el frontend. El backend es **GestionDeAdmisiones** (Spring Boot WebFlux + PostgreSQL + ClamAV).

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · react-hook-form + zod · zustand · sonner · Playwright (E2E)

## Funcionalidades

| Ruta | Quién | Qué hace | Backend |
|---|---|---|---|
| `/` | Público | Página de inicio del proceso de admisión | — |
| `/registro` | Público | Crea la cuenta de **aspirante** (no existe registro público de personal) | `POST /api/aspirantes/registro` |
| `/login` | Público | Login único: prueba aspirante y luego personal administrativo | `POST /api/aspirantes/login`, `POST /api/personal/login` |
| `/inscripcion/requisitos` | Aspirante | Verificación de requisitos mínimos | — (se envía con el formulario) |
| `/inscripcion/formulario` | Aspirante | Datos personales, académicos y programa | `POST /api/inscripciones` |
| `/inscripcion/documentos` | Aspirante | Subida de documento de identidad y foto (multipart, escaneo ClamAV) | `POST /api/inscripciones/documentos` |
| `/inscripcion/pago` | Aspirante | Registro de la transacción de pago | `POST /api/inscripciones/pago` |
| `/inscripcion/confirmacion` | Aspirante | Número de inscripción asignado por el backend | `GET /api/inscripciones/mi-estado` |
| `/estado` | Aspirante | Consulta del estado real de la inscripción | `GET /api/inscripciones/mi-estado` |
| `/admin/admisiones` | ADMISIONES | Inscripciones pendientes | `GET /api/admin/inscripciones/pendientes` |
| `/admin/personal` | ADMISIONES | Registro de nuevo personal administrativo | `POST /api/personal/registro` |
| `/admin/tesoreria` | TESORERIA | **Pendiente de integración** (sin endpoints en el backend) | — |
| `/admin/evaluacion` | EVALUACION | **Pendiente de integración** (sin endpoints en el backend) | — |

### Seguridad

- El único dato de sesión en el navegador es el **JWT** que emite el backend (`localStorage`, clave `unac_token`). Nunca se guardan contraseñas.
- El tipo de usuario, el rol y la expiración se leen de los claims del JWT solo para decidir la navegación. La autorización real la aplica el backend en cada petición.
- `/inscripcion/*` exige una sesión de aspirante y valida el paso solicitado contra el estado real de la inscripción (`mi-estado`). No se puede saltar a documentos o pago sin haber completado los pasos anteriores.
- `/admin/*` exige una sesión de personal con el rol de la sección. Cada rol solo ve y navega a su propia sección.
- Un `401` del backend cierra la sesión y redirige a `/login`.

## Puesta en marcha

Requisitos: Node 20+ y el backend corriendo.

```bash
npm install
cp .env.example .env.local   # y ajusta la URL del backend
npm run dev                  # http://localhost:3000
```

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend, p. ej. `http://localhost:8080` |

> El backend solo acepta CORS desde `http://localhost:3000`.

Los datos del proceso (costo de inscripción, periodo académico, fecha de cierre) están centralizados en [`lib/config.ts`](lib/config.ts).

## Estructura

```
app/            Rutas (App Router)
components/
  inscripcion/  Guard del flujo, indicador de pasos, subida de archivos
  layout/       Layouts de autenticación, aspirante y panel administrativo
  ui/           Componentes reutilizables
lib/
  api.ts        Cliente HTTP del backend y manejo de errores por código
  auth.ts       Sesión basada en el JWT (useSesion, guardarToken, cerrarSesion)
  inscripcion.ts Reglas de avance del flujo y etiquetas de estado
  config.ts     Datos del proceso de admisión
store/          Estado local del paso de requisitos (zustand)
types/          Tipos alineados con los DTOs del backend
e2e/            Pruebas end-to-end (Playwright)
```

## Pruebas end-to-end

Las pruebas corren contra el stack real ya levantado: frontend, backend, PostgreSQL y ClamAV. No levantan ningún servicio por sí solas.

```bash
npx playwright install chromium     # solo la primera vez

# Windows PowerShell
$env:E2E_ADMIN_EMAIL="<ADMIN_SEED_EMAIL del backend>"
$env:E2E_ADMIN_PASSWORD="<ADMIN_SEED_PASSWORD del backend>"
npm run test:e2e
```

| Variable | Por defecto | Descripción |
|---|---|---|
| `E2E_BASE_URL` | `http://localhost:3000` | Frontend |
| `E2E_API_URL` | `NEXT_PUBLIC_API_URL` o `http://localhost:8080` | Backend |
| `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` | — | Cuenta semilla de ADMISIONES |

Cobertura:

1. Un aspirante se registra, inicia sesión, completa requisitos, formulario, documentos (PDF y PNG reales escaneados por ClamAV) y pago, y llega a la confirmación con el número que asignó el backend.
2. El aspirante consulta `/estado` y ve el mismo valor que devuelve `mi-estado`.
3. La cuenta semilla de ADMISIONES ve en su panel una inscripción pendiente real, y su menú no muestra Tesorería ni Evaluación.
4. Sin sesión, `/inscripcion/documentos` redirige a `/login`.
5. `/registro` no ofrece ninguna forma de crear personal administrativo.
