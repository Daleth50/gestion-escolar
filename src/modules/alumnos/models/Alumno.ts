export interface Alumno {
  id: string;
  matricula: string;
  nombre: string;
  correo: string;
  grupo: string;
}
export type AlumnoInput = Omit<Alumno, "id">;
