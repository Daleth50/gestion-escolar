"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { mensajeError } from "@/lib/errores";
import type { LoginModel } from "../models/LoginModel";
import { authService } from "../services/authService";

export function useLoginViewModel() {
  const router = useRouter();

  const [form, setForm] = useState<LoginModel>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const updateField = (field: keyof LoginModel, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const login = async () => {
    setError(null);
    setCargando(true);
    try {
      const sesion = await authService.login(form);
      authService.guardarSesion(sesion);
      router.push("/dashboard");
    } catch (e) {
      setError(mensajeError(e, "No se pudo iniciar sesión"));
    } finally {
      setCargando(false);
    }
  };

  return {
    form,
    updateField,
    login,
    error,
    cargando,
  };
}
