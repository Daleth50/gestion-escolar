"use client";
import {
  Box, Paper, Typography, TextField, Button, Stack, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, Alert,
} from "@mui/material";
import { useAlumnosViewModel } from "../viewmodels/useAlumnosViewModel";

export default function AlumnosView() {
  const vm = useAlumnosViewModel();
  const nombreGrupo = (id: string | null) =>
    vm.grupos.find(g => g.id === id)?.clave ?? "Sin grupo";
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alumnos
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">
          {vm.editandoId ? "Editar alumno" : "Nuevo alumno"}
        </Typography>
        {vm.error && <Alert severity="error">{vm.error}</Alert>}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField label="Matrícula" value={vm.form.matricula}
            onChange={e => vm.actualizarCampo("matricula", e.target.value)} />
          <TextField label="Nombre" value={vm.form.nombre}
            onChange={e => vm.actualizarCampo("nombre", e.target.value)} />
          <TextField label="Correo" type="email" value={vm.form.correo}
            onChange={e => vm.actualizarCampo("correo", e.target.value)} />
          <TextField select label="Grupo" value={vm.form.grupoId ?? ""}
            onChange={e => vm.actualizarCampo("grupoId", e.target.value || null)}>
            <MenuItem value="">Sin grupo</MenuItem>
            {vm.grupos.map(g => (
              <MenuItem key={g.id} value={g.id}>{g.clave} ({g.cicloEscolar})</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" disabled={vm.loading} onClick={vm.guardar}>
              {vm.editandoId ? "Guardar cambios" : "Agregar"}
            </Button>
            <Button onClick={vm.cancelar}>Cancelar</Button>
          </Stack>
        </Stack>
      </Paper>
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matrícula</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vm.alumnos.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.matricula}</TableCell>
                <TableCell>{a.nombre}</TableCell>
                <TableCell>{a.correo}</TableCell>
                <TableCell>{nombreGrupo(a.grupoId)}</TableCell>
                <TableCell>
                  <Button onClick={() => vm.editar(a)}>Editar</Button>
                  <Button color="error" onClick={() => {
                    if (window.confirm("¿Eliminar alumno?")) vm.eliminar(a.id);
                  }}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {vm.alumnos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Sin alumnos</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
