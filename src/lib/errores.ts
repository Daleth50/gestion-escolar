import { isAxiosError } from "axios";

export function mensajeError(e: unknown, porDefecto: string): string {
  if (isAxiosError(e)) return e.response?.data?.error ?? porDefecto;
  return porDefecto;
}
