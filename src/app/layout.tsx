import type { Metadata } from "next";
import { CssBaseline } from "@mui/material";

export const metadata: Metadata = {
  title: "Gestión Escolar",
  description: "Sistema de administración escolar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <CssBaseline />
        {children}
      </body>
    </html>
  );
}
