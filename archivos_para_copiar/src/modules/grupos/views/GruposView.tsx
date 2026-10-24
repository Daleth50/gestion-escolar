"use client";
import {useEffect,useState} from "react";
import {schoolStore,Materia} from "@/lib/schoolStore";
import {useGrupoViewModel} from "../viewmodels/useGrupoViewModel";
import {Alert,Button,Checkbox,FormControlLabel,Paper,Stack,TextField,Typography,Table,TableBody,TableCell,TableHead,TableRow} from "@mui/material";
export default function GruposView(){const vm=useGrupoViewModel();const [materias,setMaterias]=useState<Materia[]>([]);
useEffect(()=>{const refresh=()=>setMaterias(schoolStore.leer().materias);refresh();return schoolStore.suscribir(refresh);},[]);
return <Stack spacing={3}><Typography variant="h4">Grupos</Typography><Paper sx={{p:3}}><Stack spacing={2}>
{vm.error&&<Alert severity="error">{vm.error}</Alert>}
<TextField label="Clave" value={vm.form.clave} onChange={e=>vm.campo("clave",e.target.value)}/>
<TextField label="Semestre" type="number" value={vm.form.semestre} onChange={e=>vm.campo("semestre",Number(e.target.value))}/>
<TextField label="Ciclo escolar" value={vm.form.ciclo} onChange={e=>vm.campo("ciclo",e.target.value)}/>
<Typography variant="subtitle1">Materias asignadas</Typography>
{materias.map(m=><FormControlLabel key={m.id} label={m.nombre} control={<Checkbox checked={vm.form.materiaIds.includes(m.id)} onChange={e=>vm.campo("materiaIds",e.target.checked?[...vm.form.materiaIds,m.id]:vm.form.materiaIds.filter(x=>x!==m.id))}/>}/>)}
<Stack direction="row" spacing={2}><Button variant="contained" disabled={!vm.form.clave.trim()||!vm.form.ciclo.trim()||vm.form.semestre<1} onClick={vm.guardar}>{vm.id?"Actualizar":"Agregar"}</Button><Button onClick={vm.cancelar}>Cancelar</Button></Stack>
</Stack></Paper><Paper sx={{overflowX:"auto"}}><Table><TableHead><TableRow><TableCell>Clave</TableCell><TableCell>Semestre</TableCell><TableCell>Ciclo</TableCell><TableCell>Materias</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead><TableBody>
{vm.items.map(g=><TableRow key={g.id}><TableCell>{g.clave}</TableCell><TableCell>{g.semestre}</TableCell><TableCell>{g.ciclo}</TableCell><TableCell>{g.materiaIds.map(id=>materias.find(m=>m.id===id)?.nombre??id).join(", ")}</TableCell><TableCell><Button onClick={()=>vm.editar(g)}>Editar</Button><Button color="error" onClick={()=>{if(confirm("¿Eliminar grupo?"))vm.eliminar(g.id);}}>Eliminar</Button></TableCell></TableRow>)}
</TableBody></Table></Paper></Stack>}
