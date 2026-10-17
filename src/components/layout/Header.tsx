"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

import SchoolIcon from "@mui/icons-material/School";
import Link from "next/link";
import { navigation } from "@/config/navigation";

export default function Header() {
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
      </Toolbar>
    </AppBar>
  );
}
