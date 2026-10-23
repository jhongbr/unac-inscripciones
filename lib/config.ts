// Datos del proceso de admisión. Se definen una sola vez para que todas las
// pantallas muestren el mismo valor.

export const COSTO_INSCRIPCION = 145243;

export const PERIODO_ACADEMICO = "2027-1";

export const SEMESTRES_DISPONIBLES = [PERIODO_ACADEMICO];

export const FECHA_CIERRE_INSCRIPCIONES = "15 de diciembre de 2026";

export const CORREO_SOPORTE = "admisiones@unac.edu.co";

export function formatearPesos(valor: number) {
  return `$${valor.toLocaleString("es-CO")} COP`;
}

export const TAMANO_MAXIMO_ARCHIVO = 5 * 1024 * 1024;
