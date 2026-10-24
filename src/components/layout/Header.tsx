"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigation } from "@/config/navigation";
import { authService } from "@/modules/auth/services/authService";

export default function Header() {
  const router = useRouter();

  const cerrarSesion = () => {
    authService.cerrarSesion();
    router.push("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <SchoolIcon sx={{ mr: 2 }} />

        <Typography variant="h6" sx={{ mr: 4 }}>
          Gestión Escolar
        </Typography>

        <Box sx={{ flexGrow: 1 }}>
          {navigation.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              href={item.path}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Button
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </Button>
      </Toolbar>
    </AppBar>
  );
}
