"use client";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useProfesorViewModel } from "../viewmodels/useProfesorViewModel";

export default function ProfesoresView() {
  const vm = useProfesorViewModel();
  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vm.form.correo);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Profesores</Typography>
      {vm.error && <Alert severity="error">{vm.error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={vm.form.nombre}
            disabled={vm.loading}
            onChange={(event) => vm.campo("nombre", event.target.value)}
          />
          <TextField
            label="Correo"
            type="email"
            value={vm.form.correo}
            disabled={vm.loading}
            onChange={(event) => vm.campo("correo", event.target.value)}
          />
          <TextField
            label="Especialidad"
            value={vm.form.especialidad}
            disabled={vm.loading}
            onChange={(event) => vm.campo("especialidad", event.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={vm.form.activo}
                disabled={vm.loading}
                onChange={(event) => vm.campo("activo", event.target.checked)}
              />
            }
            label="Activo"
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              disabled={
                vm.loading ||
                !vm.form.nombre.trim() ||
                !correoValido
              }
              onClick={() => void vm.guardar()}
            >
              {vm.id ? "Actualizar" : "Agregar"}
            </Button>
            <Button disabled={vm.loading} onClick={vm.cancelar}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Paper>
      <Paper sx={{ overflowX: "auto" }}>
        {vm.loading && (
          <Stack alignItems="center" sx={{ p: 2 }}>
            <CircularProgress size={24} aria-label="Cargando profesores" />
          </Stack>
        )}
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
            {vm.profesores.map((profesor) => (
              <TableRow key={profesor.id}>
                <TableCell>{profesor.nombre}</TableCell>
                <TableCell>{profesor.correo}</TableCell>
                <TableCell>{profesor.especialidad}</TableCell>
                <TableCell>{profesor.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <Button
                    disabled={vm.loading}
                    onClick={() => vm.editar(profesor)}
                  >
                    Editar
                  </Button>
                  <Button
                    color="error"
                    disabled={vm.loading}
                    onClick={() => {
                      if (window.confirm("¿Eliminar profesor?")) {
                        void vm.eliminar(profesor.id);
                      }
                    }}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!vm.loading && vm.profesores.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Sin profesores</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
