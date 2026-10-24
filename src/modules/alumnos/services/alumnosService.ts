import { api } from "@/lib/api";
import type { Alumno, AlumnoInput } from "../models/Alumno";

export const alumnosService = {
  async listar(): Promise<Alumno[]> {
    const { data } = await api.get<Alumno[]>("/alumnos");
    return data;
  },
  async obtener(id: string): Promise<Alumno> {
    const { data } = await api.get<Alumno>(`/alumnos/${id}`);
    return data;
  },
  async crear(datos: AlumnoInput): Promise<Alumno> {
    const { data } = await api.post<Alumno>("/alumnos", datos);
    return data;
  },
  async actualizar(id: string, datos: AlumnoInput): Promise<Alumno> {
    const { data } = await api.put<Alumno>(`/alumnos/${id}`, datos);
    return data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete(`/alumnos/${id}`);
  }
};
