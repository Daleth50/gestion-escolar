"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { getApiErrorMessage } from "@/lib/api";
import {
  dashboardService,
  type DashboardResumen,
} from "../services/dashboardService";

const initial: DashboardResumen = {
  totalAlumnos: 0,
  totalProfesores: 0,
  totalMaterias: 0,
  totalGrupos: 0,
};

export default function DashboardView() {
  const [resumen, setResumen] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    dashboardService
      .obtenerResumen()
      .then((result) => {
        if (mounted) setResumen(result);
      })
      .catch((requestError: unknown) => {
        if (mounted) {
          setError(
            getApiErrorMessage(
              requestError,
              "No se pudo cargar el resumen del Dashboard",
            ),
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress aria-label="Cargando resumen" />
      ) : (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {Object.entries(resumen).map(([label, total]) => (
            <Card key={label} sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="text.secondary">
                  {label.replace("total", "")}
                </Typography>
                <Typography variant="h3">{total}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
