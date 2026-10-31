import { api } from "@/lib/api";
import { alumnosService } from "../../alumnos/services/alumnosService";
import { gruposService } from "../../grupos/services/gruposService";
import { materiasService } from "../../materias/services/materiasService";
import { profesoresService } from "../../profesores/services/profesoresService";
import type { Alumno } from "../../alumnos/models/Alumno";
import type { Grupo } from "../../grupos/models/Grupo";
import type { Materia } from "../../materias/models/Materia";
import type { Profesor } from "../../profesores/models/Profesor";

export type Escolar = { profesores: Profesor[]; alumnos: Alumno[]; materias: Materia[]; grupos: Grupo[] };
export type TipoReporte = "todos" | "profesores" | "alumnos" | "materias" | "grupos";
export type FilaReporte = { tipo: string; codigo: string; nombre: string; detalle: string };
export type Resumen = { totalAlumnos: number; totalProfesores: number; totalMaterias: number; totalGrupos: number };

const etiquetas: Record<Exclude<TipoReporte, "todos">, string> = {
  profesores: "Profesor", alumnos: "Alumno", materias: "Materia", grupos: "Grupo"
};

export async function cargarDatosEscolares(): Promise<Escolar> {
  const [profesores, alumnos, materias, grupos] = await Promise.all([
    profesoresService.listar(), alumnosService.listar(),
    materiasService.listar(), gruposService.listar()
  ]);
  return { profesores, alumnos, materias, grupos };
}

export async function obtenerResumen(): Promise<Resumen> {
  const { data } = await api.get<Resumen>("/reportes/resumen");
  return data;
}

export function generarReporte(data: Escolar, tipo: TipoReporte, filtro: string): FilaReporte[] {
  const rows: FilaReporte[] = [
    ...data.profesores.map(p => ({ tipo: "Profesor", codigo: p.id, nombre: p.nombre, detalle: p.especialidad ?? "" })),
    ...data.alumnos.map(a => ({ tipo: "Alumno", codigo: a.matricula, nombre: a.nombre,
      detalle: data.grupos.find(g => g.id === a.grupoId)?.clave ?? "Sin grupo" })),
    ...data.materias.map(m => ({ tipo: "Materia", codigo: m.clave, nombre: m.nombre,
      detalle: data.profesores.find(p => p.id === m.profesorId)?.nombre ?? "Sin profesor" })),
    ...data.grupos.map(g => ({ tipo: "Grupo", codigo: g.clave, nombre: g.cicloEscolar, detalle: `${g.materiaIds.length} materias` }))
  ];
  const texto = filtro.toLowerCase();
  return rows.filter(r => (tipo === "todos" || r.tipo === etiquetas[tipo]) &&
    Object.values(r).some(v => v.toLowerCase().includes(texto)));
}

export function exportarCSV(rows: FilaReporte[]) {
  const cell = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const csv = ["Tipo,Código,Nombre,Detalle", ...rows.map(r => [r.tipo, r.codigo, r.nombre, r.detalle].map(cell).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte-escolar.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
