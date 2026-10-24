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

  haySesionVigente(): boolean {
    try {
      const sesion: LoginResponse = JSON.parse(
        localStorage.getItem(SESSION_KEY) ?? "null",
      );
      const payload = JSON.parse(
        atob(sesion.token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")),
      );
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
  },
};
