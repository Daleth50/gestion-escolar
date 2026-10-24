export interface Profesor {
  id: string;
  nombre: string;
  correo: string;
  especialidad: string | null;
  activo: boolean;
}

export type ProfesorInput = Omit<Profesor, "id">;
