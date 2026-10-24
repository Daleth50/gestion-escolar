import { api } from "@/lib/api";
import type { LoginModel, LoginResponse } from "../models/LoginModel";

const SESSION_KEY = "sesion";

export const authService = {
  async login(credenciales: LoginModel): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", credenciales);
    return data;
  },

  guardarSesion(sesion: LoginResponse) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  },

  cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
  },
};
