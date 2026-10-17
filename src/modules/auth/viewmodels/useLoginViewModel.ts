"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { LoginModel } from "../models/LoginModel";

export function useLoginViewModel() {
  const router = useRouter();

  const [form, setForm] = useState<LoginModel>({
    email: "",
    password: "",
  });

  const updateField = (field: keyof LoginModel, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const login = () => {
    // Práctica inicial:
    // No se validan credenciales.
    // No se crea una sesión.
    router.push("/dashboard");
  };

  return {
    form,
    updateField,
    login,
  };
}
