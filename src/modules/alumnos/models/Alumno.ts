export interface Alumno {
  id: string;
  matricula: string;
  nombre: string;
  correo: string;
  grupoId: string | null;
}
export type AlumnoInput = Omit<Alumno, "id">;
