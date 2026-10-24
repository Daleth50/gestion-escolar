"use client";
import { useEffect, useState } from "react";
import { mensajeError } from "@/lib/errores";
import { cargarDatosEscolares, exportarCSV, generarReporte, type Escolar, type TipoReporte } from "../services/reportesService";

export type { TipoReporte };

const vacio: Escolar = { profesores: [], alumnos: [], materias: [], grupos: [] };

export function useReportesViewModel() {
  const [tipo, setTipo] = useState<TipoReporte>("todos");
  const [filtro, setFiltro] = useState("");
  const [data, setData] = useState<Escolar>(vacio);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatosEscolares().then(setData)
      .catch(e => setError(mensajeError(e, "No se pudo cargar el reporte")));
  }, []);

  const filas = generarReporte(data, tipo, filtro);
  return { tipo, setTipo, filtro, setFiltro, filas, error, exportar: () => exportarCSV(filas) };
}
