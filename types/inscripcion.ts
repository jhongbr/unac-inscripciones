export interface RequisitosData {
  tieneTituloBachiller: "si" | "no" | null;
  presentoIcfes: "si" | "no" | null;
  confirmaVeracidad: boolean;
}

/** Valores de EstadoInscripcion en el backend. */
export type EstadoInscripcionCodigo =
  | "PENDIENTE"
  | "EN_REVISION"
  | "INCOMPLETO"
  | "ENVIADO"
  | "APROBADO"
  | "RECHAZADO";

/** Cuerpo de POST /api/inscripciones (InscripcionRequestDTO). */
export interface CrearInscripcionInput {
  cumpleTituloBachiller: boolean;
  cumpleIcfes: boolean;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  ciudadResidencia: string;
  institucionBachillerato: string;
  municipioColegio: string;
  anioGraduacion: number;
  codigoResultadoIcfes: string;
  puntajeGlobalIcfes: number;
  facultad: string;
  programa: string;
  semestre: string;
}

/** Respuesta de crear inscripción, adjuntar documentos, registrar pago, validar pago y evaluar. */
export interface Inscripcion {
  id: number;
  numeroInscripcion: string;
  estado: EstadoInscripcionCodigo;
  programa: string;
  semestre: string;
}

/** Cuerpo de POST /api/inscripciones/pago (RegistrarPagoRequestDTO). */
export interface RegistrarPagoInput {
  referenciaPago: string;
  fechaPago: string;
  bancoPago: string;
  confirmacionVeracidad: boolean;
}

/** Respuesta de GET /api/inscripciones/mi-estado. */
export interface EstadoInscripcion extends Inscripcion {
  fechaCreacion: string;
  documentoIdentidadCargado: boolean;
  fotoCargada: boolean;
  referenciaPago: string | null;
  fechaPago: string | null;
}

/** Elemento de GET /api/admin/inscripciones/pendientes. */
export interface InscripcionPendiente {
  inscripcionId: number;
  numeroInscripcion: string;
  estado: EstadoInscripcionCodigo;
  correoAspirante: string;
  nombresAspirante: string;
  apellidosAspirante: string;
  fechaCreacion: string;
}

/** Respuesta de GET /api/admin/inscripciones/{id} (InscripcionDetalleResponseDTO). */
export interface InscripcionDetalle {
  id: number;
  numeroInscripcion: string;
  estado: EstadoInscripcionCodigo;
  observacion: string | null;

  correoAspirante: string;
  nombresAspirante: string;
  apellidosAspirante: string;

  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  telefono: string;
  ciudadResidencia: string;
  institucionBachillerato: string;
  municipioColegio: string;
  anioGraduacion: number;
  codigoResultadoIcfes: string;
  puntajeGlobalIcfes: number;
  facultad: string;
  programa: string;
  semestre: string;

  documentoIdentidadUrl: string | null;
  fotoUrl: string | null;
  referenciaPago: string | null;
  fechaPago: string | null;
  bancoPago: string | null;

  fechaCreacion: string;
}
