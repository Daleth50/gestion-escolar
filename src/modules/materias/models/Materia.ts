export interface Materia {
  id: string;
  clave: string;
  nombre: string;
  creditos: number;
  profesorId: string | null;
}
export type MateriaInput = Omit<Materia, "id">;
