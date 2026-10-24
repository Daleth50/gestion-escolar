import { api } from "@/lib/api";
import type { Profesor, ProfesorInput } from "../models/Profesor";

interface ProfesorApi {
  id: string;
  nombre: string;
  correo: string;
  especialidad: string | null;
  estatus: "Activo" | "Inactivo";
}

function toProfesor(profesor: ProfesorApi): Profesor {
  return {
    id: profesor.id,
    nombre: profesor.nombre,
    correo: profesor.correo,
    especialidad: profesor.especialidad,
    activo: profesor.estatus === "Activo",
  };
}

function toApiInput(profesor: ProfesorInput) {
  return {
    nombre: profesor.nombre,
    correo: profesor.correo,
    especialidad: profesor.especialidad,
    estatus: profesor.activo ? "Activo" : "Inactivo",
  };
}

export const profesoresService = {
  async listar(): Promise<Profesor[]> {
    const { data } = await api.get<ProfesorApi[]>("/profesores");
    return data.map(toProfesor);
  },

  async crear(datos: ProfesorInput): Promise<Profesor> {
    const { data } = await api.post<ProfesorApi>(
      "/profesores",
      toApiInput(datos),
    );
    return toProfesor(data);
  },

  async actualizar(id: string, datos: ProfesorInput): Promise<Profesor> {
    const { data } = await api.put<ProfesorApi>(
      `/profesores/${encodeURIComponent(id)}`,
      toApiInput(datos),
    );
    return toProfesor(data);
  },

  async eliminar(id: string): Promise<void> {
    await api.delete(`/profesores/${encodeURIComponent(id)}`);
  },
};
