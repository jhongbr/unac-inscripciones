import { create } from "zustand";
import type { RequisitosData } from "@/types/inscripcion";

// El backend es la fuente de verdad de la inscripción; aquí solo vive la
// respuesta del paso de requisitos, que se envía junto con el formulario.
interface InscripcionStore {
  requisitos: RequisitosData;
  setRequisitos: (data: RequisitosData) => void;
  reset: () => void;
}

const requisitosIniciales: RequisitosData = {
  tieneTituloBachiller: null,
  presentoIcfes: null,
  confirmaVeracidad: false,
};

export const useInscripcionStore = create<InscripcionStore>((set) => ({
  requisitos: requisitosIniciales,
  setRequisitos: (data) => set({ requisitos: data }),
  reset: () => set({ requisitos: requisitosIniciales }),
}));

export function requisitosCumplidos(requisitos: RequisitosData) {
  return (
    requisitos.tieneTituloBachiller === "si" &&
    requisitos.presentoIcfes === "si" &&
    requisitos.confirmaVeracidad
  );
}
