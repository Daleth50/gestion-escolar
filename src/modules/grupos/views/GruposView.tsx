"use client";
import {Alert,Button,Checkbox,FormControlLabel,Paper,Stack,TextField,Typography,Table,TableBody,TableCell,TableHead,TableRow} from "@mui/material";
import {useGrupoViewModel} from "../viewmodels/useGrupoViewModel";

export default function GruposView(){
  const vm=useGrupoViewModel();
  return <Stack spacing={3}>
    <Typography variant="h4">Grupos</Typography>
    <Paper sx={{p:3}}>
      <Stack spacing={2}>
        {vm.error&&<Alert severity="error">{vm.error}</Alert>}
        <TextField label="Clave" value={vm.form.clave} onChange={e=>vm.actualizarCampo("clave",e.target.value)}/>
        <TextField label="Semestre" type="number" value={vm.form.semestre} onChange={e=>vm.actualizarCampo("semestre",Number(e.target.value))}/>
        <TextField label="Ciclo escolar" value={vm.form.cicloEscolar} onChange={e=>vm.actualizarCampo("cicloEscolar",e.target.value)}/>
        <Typography variant="subtitle1">Materias asignadas</Typography>
        {vm.materias.map(m=><FormControlLabel key={m.id} label={m.nombre} control={<Checkbox checked={vm.form.materiaIds.includes(m.id)} onChange={e=>vm.alternarMateria(m.id,e.target.checked)}/>}/>)}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" disabled={vm.loading||!vm.form.clave.trim()||!vm.form.cicloEscolar.trim()||vm.form.semestre<1} onClick={vm.guardar}>{vm.editandoId?"Actualizar":"Agregar"}</Button>
          <Button onClick={vm.cancelar}>Cancelar</Button>
        </Stack>
      </Stack>
    </Paper>
    <Paper sx={{overflowX:"auto"}}>
      <Table>
        <TableHead><TableRow><TableCell>Clave</TableCell><TableCell>Semestre</TableCell><TableCell>Ciclo</TableCell><TableCell>Materias</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
        <TableBody>
          {vm.grupos.map(g=><TableRow key={g.id}>
            <TableCell>{g.clave}</TableCell>
            <TableCell>{g.semestre}</TableCell>
            <TableCell>{g.cicloEscolar}</TableCell>
            <TableCell>{g.materiaIds.map(id=>vm.materias.find(m=>m.id===id)?.nombre??id).join(", ")}</TableCell>
            <TableCell>
              <Button onClick={()=>vm.editar(g)}>Editar</Button>
              <Button color="error" onClick={()=>{if(confirm("¿Eliminar grupo?"))vm.eliminar(g.id);}}>Eliminar</Button>
            </TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </Paper>
  </Stack>;
}
