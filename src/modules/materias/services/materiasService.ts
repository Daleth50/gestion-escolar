import { api } from "@/lib/api";
import type { Materia, MateriaInput } from "../models/Materia";

export const materiasService = {
  async listar(): Promise<Materia[]> {
    const { data } = await api.get<Materia[]>("/materias");
    return data;
  },
  async obtener(id: string): Promise<Materia> {
    const { data } = await api.get<Materia>(`/materias/${id}`);
    return data;
  },
  async crear(datos: MateriaInput): Promise<Materia> {
    const { data } = await api.post<Materia>("/materias", datos);
    return data;
  },
  async actualizar(id: string, datos: MateriaInput): Promise<Materia> {
    const { data } = await api.put<Materia>(`/materias/${id}`, datos);
    return data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete(`/materias/${id}`);
  }
};
