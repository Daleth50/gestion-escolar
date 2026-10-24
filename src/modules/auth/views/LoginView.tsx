"use client";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Alert,
} from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";

import { useLoginViewModel } from "../viewmodels/useLoginViewModel";

export default function LoginView() {
  const { form, updateField, login, error, cargando } = useLoginViewModel();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "grey.100",
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            mb: 3,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 56,
              height: 56,
              mb: 2,
            }}
          >
            <SchoolIcon />
          </Avatar>

          <Typography variant="h5">Gestión Escolar</Typography>

          <Typography variant="body2" color="text.secondary">
            Acceso al sistema
          </Typography>
        </Box>

        <Box
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            login();
          }}
        >
          <TextField
            fullWidth
            label="Correo electrónico"
            type="email"
            margin="normal"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            margin="normal"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            disabled={cargando}
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
          >
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
