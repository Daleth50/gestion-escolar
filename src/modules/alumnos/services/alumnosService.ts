import type { Alumno, AlumnoInput } from "../models/Alumno";
let datos: Alumno[] = [
  {
    id: "1",
    matricula: "A001",
    nombre: "Ana López",
    correo: "ana@ejemplo.edu",
    grupo: "1A",
  },
  {
    id: "2",
    matricula: "A002",
    nombre: "Luis Pérez",
    correo: "luis@ejemplo.edu",
    grupo: "1B",
  },
];
export const alumnosService = {
  listar: () => datos.map((a) => ({ ...a })),
  crear: (a: AlumnoInput) => {
    if (datos.some((x) => x.matricula === a.matricula))
      throw Error("Matrícula duplicada");
    const nuevo = { id: crypto.randomUUID(), ...a };
    datos = [...datos, nuevo];
    return nuevo;
  },
  actualizar: (id: string, a: AlumnoInput) => {
    if (!datos.some((x) => x.id === id)) throw Error("Alumno inexistente");
    if (datos.some((x) => x.id !== id && x.matricula === a.matricula))
      throw Error("Matrícula duplicada");
    datos = datos.map((x) => (x.id === id ? { id, ...a } : x));
  },
  eliminar: (id: string) => {
    datos = datos.filter((x) => x.id !== id);
  },
};
