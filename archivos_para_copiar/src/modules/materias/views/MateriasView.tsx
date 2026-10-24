"use client";
import {useEffect,useState} from "react";
import {schoolStore,Profesor} from "@/lib/schoolStore";
import {useMateriaViewModel} from "../viewmodels/useMateriaViewModel";
import {Alert,Button,MenuItem,Paper,Stack,TextField,Typography,Table,TableBody,TableCell,TableHead,TableRow} from "@mui/material";
export default function MateriasView(){const vm=useMateriaViewModel();const [profesores,setProfesores]=useState<Profesor[]>([]);
useEffect(()=>{const refresh=()=>setProfesores(schoolStore.leer().profesores);refresh();return schoolStore.suscribir(refresh);},[]);
return <Stack spacing={3}><Typography variant="h4">Materias</Typography><Paper sx={{p:3}}><Stack spacing={2}>
{vm.error&&<Alert severity="error">{vm.error}</Alert>}
<TextField label="Clave" value={vm.form.clave} onChange={e=>vm.campo("clave",e.target.value)}/>
<TextField label="Nombre" value={vm.form.nombre} onChange={e=>vm.campo("nombre",e.target.value)}/>
<TextField label="Créditos" type="number" value={vm.form.creditos} onChange={e=>vm.campo("creditos",Number(e.target.value))}/>
<TextField select label="Profesor" value={vm.form.profesorId} onChange={e=>vm.campo("profesorId",e.target.value)}><MenuItem value="">Sin asignar</MenuItem>{profesores.map(p=><MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}</TextField>
<Stack direction="row" spacing={2}><Button variant="contained" disabled={!vm.form.clave.trim()||!vm.form.nombre.trim()||vm.form.creditos<1} onClick={vm.guardar}>{vm.id?"Actualizar":"Agregar"}</Button><Button onClick={vm.cancelar}>Cancelar</Button></Stack>
</Stack></Paper><Paper sx={{overflowX:"auto"}}><Table><TableHead><TableRow><TableCell>Clave</TableCell><TableCell>Materia</TableCell><TableCell>Créditos</TableCell><TableCell>Profesor</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead><TableBody>
{vm.items.map(m=><TableRow key={m.id}><TableCell>{m.clave}</TableCell><TableCell>{m.nombre}</TableCell><TableCell>{m.creditos}</TableCell><TableCell>{profesores.find(p=>p.id===m.profesorId)?.nombre??"Sin asignar"}</TableCell><TableCell><Button onClick={()=>vm.editar(m)}>Editar</Button><Button color="error" onClick={()=>{if(confirm("¿Eliminar materia?"))vm.eliminar(m.id);}}>Eliminar</Button></TableCell></TableRow>)}
</TableBody></Table></Paper></Stack>}
