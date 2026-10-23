export type RolPersonal = "ADMISIONES" | "TESORERIA" | "EVALUACION";

/** Claims del JWT emitido por el backend (JwtProvider). */
export type Sesion =
  | { tipo: "ASPIRANTE"; id: number; correo: string; expira: number }
  | { tipo: "PERSONAL"; id: number; correo: string; rol: RolPersonal; expira: number };

export interface LoginPersonalResponse {
  token: string;
  tipo: string;
  rol: RolPersonal;
}

export interface RegistroPersonalInput {
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  contrasena: string;
  rol: RolPersonal;
}

export interface PersonalAdministrativo {
  id: number;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  rol: RolPersonal;
}
