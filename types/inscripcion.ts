export interface RequisitosData {
  tieneTituloBachiller: "si" | "no" | null;
  presentoIcfes: "si" | "no" | null;
  confirmaVeracidad: boolean;
}

export interface DatosPersonales {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  genero: string;
  correo: string;
  telefono: string;
  ciudadResidencia: string;
}

export interface DatosAcademicos {
  institucionBachillerato: string;
  municipioColegio: string;
  anioGraduacion: string;
  codigoResultadoIcfes: string;
  puntajeGlobalSaber11: string;
}

export interface ProgramaSeleccionado {
  facultad: string;
  programa: string;
  semestre: string;
}

export interface DocumentoAdjunto {
  nombre: string;
  tamano: number;
  tipo: string;
}

export interface DatosPago {
  metodoPago: "transferencia" | "consignacion" | "pse" | "tarjeta" | null;
  referenciaPago: string;
  fechaPago: string;
  banco: string;
  confirmaDatos: boolean;
}

export interface InscripcionState {
  requisitos: RequisitosData;
  datosPersonales: DatosPersonales | null;
  datosAcademicos: DatosAcademicos | null;
  programa: ProgramaSeleccionado | null;
  documentoIdentidad: DocumentoAdjunto | null;
  fotoDocumento: DocumentoAdjunto | null;
  pago: DatosPago | null;
  numeroInscripcion: string | null;
}
