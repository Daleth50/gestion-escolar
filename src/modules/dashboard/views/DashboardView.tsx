"use client";
import {useEffect,useState} from "react";
import {mensajeError} from "@/lib/errores";
import {obtenerResumen} from "../../reportes/services/reportesService";
import {Alert,Card,CardContent,Stack,Typography} from "@mui/material";

const etiquetas={totalAlumnos:"alumnos",totalProfesores:"profesores",totalMaterias:"materias",totalGrupos:"grupos"} as const;

export default function DashboardView(){
  const [totales,setTotales]=useState<Record<keyof typeof etiquetas,number>>({totalAlumnos:0,totalProfesores:0,totalMaterias:0,totalGrupos:0});
  const [error,setError]=useState("");
  useEffect(()=>{obtenerResumen().then(setTotales).catch(e=>setError(mensajeError(e,"No se pudo cargar el resumen")));},[]);
  return <>
    <Typography variant="h4" gutterBottom>Dashboard</Typography>
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    <Stack direction={{xs:"column",md:"row"}} spacing={2}>
      {(Object.keys(etiquetas) as (keyof typeof etiquetas)[]).map(k=><Card key={k} sx={{flex:1}}><CardContent>
        <Typography color="text.secondary">{etiquetas[k]}</Typography>
        <Typography variant="h3">{totales[k]}</Typography>
      </CardContent></Card>)}
    </Stack>
  </>;
}
