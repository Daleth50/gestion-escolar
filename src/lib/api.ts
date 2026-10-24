import axios from "axios";

// En el navegador se usa el mismo host desde el que se abrió la app (localhost o IP de red).
const baseURL = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.hostname}:4000/api`
  : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});
