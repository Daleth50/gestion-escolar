"use client";
import {useProfesoresViewModel} from "../viewmodels/useProfesorViewModel";
import {Alert,Button,Checkbox,FormControlLabel,Paper,Stack,TextField,Typography,Table,TableBody,TableCell,TableHead,TableRow} from "@mui/material";
export default function ProfesoresView(){const vm=useProfesoresViewModel();return <Stack spacing={3}>

<Typography variant="h4">Profesores</Typography><Paper sx={{p:3}}>
    <Stack spacing={2}>
        {vm.error&&<Alert severity="error">{vm.error}</Alert>}
        <TextField label="Nombre" value={vm.form.nombre} onChange={e=>vm.actualizarCampo("nombre",e.target.value)}/>
        <TextField label="Correo" type="email" value={vm.form.correo} onChange={e=>vm.actualizarCampo("correo",e.target.value)}/>
        <TextField label="Especialidad" value={vm.form.especialidad} onChange={e=>vm.actualizarCampo("especialidad",e.target.value)}/>
        <FormControlLabel control={<Checkbox checked={vm.form.estatus==="Activo"} onChange={e=>vm.actualizarCampo("estatus",e.target.checked?"Activo":"Inactivo")}/>} label="Activo"/>
        <Stack direction="row" spacing={2}>
            <Button variant="contained" disabled={!vm.form.nombre.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vm.form.correo)} onClick={vm.guardar}>{vm.editandoId?"Actualizar":"Agregar"}</Button>
        <Button onClick={vm.cancelar}>Cancelar</Button>
    </Stack>
</Stack>
</Paper>
<Paper sx={{overflowX:"auto"}}>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {vm.profesores.map(p => (
                <TableRow key={p.id}>
                    <TableCell>{p.nombre}</TableCell>
                    <TableCell>{p.correo}</TableCell>
                    <TableCell>{p.especialidad}</TableCell>
                    <TableCell>{p.estatus}</TableCell>
                    <TableCell>
                        <Button onClick={() => vm.editar(p)}>Editar</Button>
                        <Button color="error" onClick={() => {
                            if (confirm("¿Eliminar profesor?")) {
                                vm.eliminar(p.id);
                            }
                        }}>
                            Eliminar
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</Paper></Stack>}