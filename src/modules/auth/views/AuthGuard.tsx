"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authService } from "../services/authService";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (authService.haySesionVigente()) {
      setAutorizado(true);
    } else {
      authService.cerrarSesion();
      router.replace("/login");
    }
  }, [router]);

  return autorizado ? <>{children}</> : null;
}
