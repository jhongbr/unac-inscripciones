export interface Aspirante {
  id: number;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
}

export interface RegistroAspiranteInput {
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  contrasena: string;
}

export interface LoginInput {
  correoElectronico: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
}
