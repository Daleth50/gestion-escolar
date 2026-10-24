"use client";
import {useEffect,useState} from "react";
import {schoolStore} from "@/lib/schoolStore";
import {Card,CardContent,Stack,Typography} from "@mui/material";
export default function DashboardView(){const [totales,setTotales]=useState({profesores:0,materias:0,grupos:0});
useEffect(()=>{const refresh=()=>{const d=schoolStore.leer();setTotales({profesores:d.profesores.length,materias:d.materias.length,grupos:d.grupos.length});};refresh();return schoolStore.suscribir(refresh);},[]);
return <><Typography variant="h4" gutterBottom>Dashboard</Typography><Stack direction={{xs:"column",md:"row"}} spacing={2}>{Object.entries(totales).map(([label,n])=><Card key={label} sx={{flex:1}}><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h3">{n}</Typography></CardContent></Card>)}</Stack><Typography sx={{mt:3}} color="text.secondary">El módulo Alumnos de la lección anterior utiliza memoria independiente; su indicador se integrará al migrarlo al repositorio compartido.</Typography></>}
