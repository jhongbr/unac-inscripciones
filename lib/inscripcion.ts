import type { EstadoInscripcion, EstadoInscripcionCodigo } from "@/types/inscripcion";

type ColorBadge = "green" | "blue" | "amber" | "red" | "gray";

export const ETIQUETA_ESTADO: Record<EstadoInscripcionCodigo, { label: string; color: ColorBadge }> = {
  PENDIENTE: { label: "Pendiente", color: "gray" },
  EN_REVISION: { label: "En revisión", color: "blue" },
  INCOMPLETO: { label: "Incompleta", color: "amber" },
  ENVIADO: { label: "Enviada a evaluación", color: "blue" },
  APROBADO: { label: "Aprobada", color: "green" },
  RECHAZADO: { label: "No admitida", color: "red" },
};

export function etiquetaEstado(codigo: string) {
  return ETIQUETA_ESTADO[codigo as EstadoInscripcionCodigo] ?? { label: codigo, color: "gray" as const };
}

export const RUTAS_INSCRIPCION = {
  requisitos: "/inscripcion/requisitos",
  formulario: "/inscripcion/formulario",
  documentos: "/inscripcion/documentos",
  pago: "/inscripcion/pago",
  confirmacion: "/inscripcion/confirmacion",
} as const;

export function documentosCompletos(estado: EstadoInscripcion) {
  return estado.documentoIdentidadCargado && estado.fotoCargada;
}

/**
 * Decide a qué paso puede entrar el aspirante según el estado real de su
 * inscripción en el backend. Devuelve la ruta solicitada si está permitida, o
 * la del paso que le corresponde.
 */
export function rutaPermitida(
  estado: EstadoInscripcion | null,
  rutaSolicitada: string,
  requisitosOk: boolean
): string {
  const R = RUTAS_INSCRIPCION;

  if (!estado) {
    if (rutaSolicitada === R.requisitos) return rutaSolicitada;
    if (rutaSolicitada === R.formulario && requisitosOk) return rutaSolicitada;
    return R.requisitos;
  }

  if (estado.referenciaPago) return R.confirmacion;
  if (!documentosCompletos(estado)) return R.documentos;
  if (rutaSolicitada === R.documentos || rutaSolicitada === R.pago) return rutaSolicitada;
  return R.pago;
}

export function formatearFecha(iso: string | null | undefined) {
  if (!iso) return "—";
  // LocalDate llega como AAAA-MM-DD; se fija la hora para no cambiar de día por zona horaria
  const fecha = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}
