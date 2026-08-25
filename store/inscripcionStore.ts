import { create } from "zustand";
import type {
  DatosAcademicos,
  DatosPago,
  DatosPersonales,
  DocumentoAdjunto,
  InscripcionState,
  ProgramaSeleccionado,
  RequisitosData,
} from "@/types/inscripcion";

interface InscripcionStore extends InscripcionState {
  setRequisitos: (data: RequisitosData) => void;
  setFormulario: (data: {
    datosPersonales: DatosPersonales;
    datosAcademicos: DatosAcademicos;
    programa: ProgramaSeleccionado;
  }) => void;
  setDocumentoIdentidad: (doc: DocumentoAdjunto | null) => void;
  setFotoDocumento: (doc: DocumentoAdjunto | null) => void;
  setPago: (data: DatosPago) => void;
  confirmarInscripcion: () => string;
  reset: () => void;
}

const estadoInicial: InscripcionState = {
  requisitos: {
    tieneTituloBachiller: null,
    presentoIcfes: null,
    confirmaVeracidad: false,
  },
  datosPersonales: null,
  datosAcademicos: null,
  programa: null,
  documentoIdentidad: null,
  fotoDocumento: null,
  pago: null,
  numeroInscripcion: null,
};

export const useInscripcionStore = create<InscripcionStore>((set, get) => ({
  ...estadoInicial,

  setRequisitos: (data) => set({ requisitos: data }),

  setFormulario: ({ datosPersonales, datosAcademicos, programa }) =>
    set({ datosPersonales, datosAcademicos, programa }),

  setDocumentoIdentidad: (doc) => set({ documentoIdentidad: doc }),

  setFotoDocumento: (doc) => set({ fotoDocumento: doc }),

  setPago: (data) => set({ pago: data }),

  confirmarInscripcion: () => {
    const existente = get().numeroInscripcion;
    if (existente) return existente;
    const anio = new Date().getFullYear();
    const numero = Math.floor(100000 + Math.random() * 900000);
    const numeroInscripcion = `INS-${anio}-${numero}`;
    set({ numeroInscripcion });
    return numeroInscripcion;
  },

  reset: () => set(estadoInicial),
}));
