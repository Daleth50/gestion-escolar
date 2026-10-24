export interface Grupo {
  id: string;
  clave: string;
  semestre: number;
  cicloEscolar: string;
  materiaIds: string[];
}
export type GrupoInput = Omit<Grupo, "id">;
