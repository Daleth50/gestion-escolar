"use client";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
} from "@mui/material";
import { useAlumnosViewModel } from "../viewmodels/useAlumnosViewModel";
export default function AlumnosView() {
  const vm = useAlumnosViewModel();
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Alumnos
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">
          {vm.editId ? "Editar alumno" : "Nuevo alumno"}
        </Typography>
        {vm.error && <Alert severity="error">{vm.error}</Alert>}
        <Stack spacing={2} sx={{ mt: 2 }}>
          {(["matricula", "nombre", "correo", "grupo"] as const).map((k) => (
            <TextField
              key={k}
              label={k}
              value={vm.form[k]}
              onChange={(e) => vm.actualizarCampo(k, e.target.value)}
            />
          ))}
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={vm.guardar}>
              {vm.editId ? "Guardar cambios" : "Agregar"}
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
            {vm.alumnos.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.matricula}</TableCell>
                <TableCell>{a.nombre}</TableCell>
                <TableCell>{a.correo}</TableCell>
                <TableCell>{a.grupo}</TableCell>
                <TableCell>
                  <Button onClick={() => vm.editar(a)}>Editar</Button>
                  <Button
                    color="error"
                    onClick={() => {
                      if (window.confirm("¿Eliminar alumno?"))
                        vm.eliminar(a.id);
                    }}
                  >
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
