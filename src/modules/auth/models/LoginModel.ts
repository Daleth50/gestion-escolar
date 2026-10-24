export interface LoginModel {
  email: string;
  password: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}
