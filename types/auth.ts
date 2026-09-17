export type AreaAdministrativa = "admisiones" | "tesoreria" | "programa";

export interface SesionAdmin {
  correoElectronico: string;
  area: AreaAdministrativa;
}
