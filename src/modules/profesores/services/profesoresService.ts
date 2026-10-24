import { api } from "@/lib/api";

export interface Profesor {
  id: string;
  nombre: string;
  correo: string;
  especialidad: string | null;
  estatus: string;
}
export type ProfesorInput = Omit<Profesor, "id">;

export const profesoresService = {
  async listar(): Promise<Profesor[]> {
    const { data } = await api.get<Profesor[]>("/profesores");
    return data;
  },
  async obtener(id: string): Promise<Profesor> {
    const { data } = await api.get<Profesor>(`/profesores/${id}`);
    return data;
  },
  async crear(datos: ProfesorInput): Promise<Profesor> {
    const { data } = await api.post<Profesor>("/profesores", datos);
    return data;
  },
  async actualizar(id: string, datos: ProfesorInput): Promise<Profesor> {
    const { data } = await api.put<Profesor>(`/profesores/${id}`, datos);
    return data;
  },
  async eliminar(id: string): Promise<void> {
    await api.delete(`/profesores/${id}`);
  }
};
