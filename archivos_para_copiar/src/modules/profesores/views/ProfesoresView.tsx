"use client";
import {useProfesorViewModel} from "../viewmodels/useProfesorViewModel";
import {Alert,Button,Checkbox,FormControlLabel,Paper,Stack,TextField,Typography,Table,TableBody,TableCell,TableHead,TableRow} from "@mui/material";
export default function ProfesoresView(){const vm=useProfesorViewModel();return <Stack spacing={3}>
<Typography variant="h4">Profesores</Typography><Paper sx={{p:3}}><Stack spacing={2}>
{vm.error&&<Alert severity="error">{vm.error}</Alert>}
<TextField label="Nombre" value={vm.form.nombre} onChange={e=>vm.campo("nombre",e.target.value)}/>
<TextField label="Correo" type="email" value={vm.form.correo} onChange={e=>vm.campo("correo",e.target.value)}/>
<TextField label="Especialidad" value={vm.form.especialidad} onChange={e=>vm.campo("especialidad",e.target.value)}/>
<FormControlLabel control={<Checkbox checked={vm.form.activo} onChange={e=>vm.campo("activo",e.target.checked)}/>} label="Activo"/>
<Stack direction="row" spacing={2}><Button variant="contained" disabled={!vm.form.nombre.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vm.form.correo)} onClick={vm.guardar}>{vm.id?"Actualizar":"Agregar"}</Button><Button onClick={vm.cancelar}>Cancelar</Button></Stack>
</Stack></Paper><Paper sx={{overflowX:"auto"}}><Table><TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Correo</TableCell><TableCell>Especialidad</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead><TableBody>
{vm.items.map(p=><TableRow key={p.id}><TableCell>{p.nombre}</TableCell><TableCell>{p.correo}</TableCell><TableCell>{p.especialidad}</TableCell><TableCell>{p.activo?"Activo":"Inactivo"}</TableCell><TableCell><Button onClick={()=>vm.editar(p)}>Editar</Button><Button color="error" onClick={()=>{if(confirm("¿Eliminar profesor?"))vm.eliminar(p.id);}}>Eliminar</Button></TableCell></TableRow>)}
</TableBody></Table></Paper></Stack>}
