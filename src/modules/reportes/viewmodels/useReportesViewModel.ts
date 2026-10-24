"use client";
import {useEffect,useState} from "react";
import {schoolStore} from "@/lib/schoolStore";
import {generarReporte,exportarCSV} from "../services/reportesService";
export type TipoReporte="todos"|"profesores"|"materias"|"grupos";
export function useReportesViewModel(){const [tipo,setTipo]=useState<TipoReporte>("todos");const [filtro,setFiltro]=useState("");const [data,setData]=useState(()=>schoolStore.leer());
useEffect(()=>{const refresh=()=>setData(schoolStore.leer());refresh();return schoolStore.suscribir(refresh);},[]);
const filas=generarReporte(data,tipo,filtro);return {tipo,setTipo,filtro,setFiltro,filas,exportar:()=>exportarCSV(filas)};}
