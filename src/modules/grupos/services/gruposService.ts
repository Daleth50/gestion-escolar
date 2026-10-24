import { api } from "@/lib/api";
import type { Grupo, GrupoInput } from "../models/Grupo";

export const gruposService = {
  async listar(): Promise<Grupo[]> {
    const { data } = await api.get<Grupo[]>("/grupos");
    return data;
  },
  async obtener(id: string): Promise<Grupo> {
    const { data } = await api.get<Grupo>(`/grupos/${id}`);
    return data;
  },
  async crear(datos: GrupoInput): Promise<Grupo> {
    const { data } = await api.post<Grupo>("/grupos", datos);
    return data;
  },
  async actualizar(id: string, datos: GrupoInput): Promise<Grupo> {
    const { data } = await api.put<Grupo>(`/grupos/${id}`, datos);
    return data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete(`/grupos/${id}`);
  }
};
