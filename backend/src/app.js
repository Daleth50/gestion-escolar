import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import profesoresRoutes from "./routes/profesoresRoutes.js";
import alumnosRoutes from "./routes/alumnosRoutes.js";
import materiasRoutes from "./routes/materiasRoutes.js";
import gruposRoutes from "./routes/gruposRoutes.js";
import reportesRoutes from "./routes/reportesRoutes.js";

const app = express();
const port = Number(process.env.PORT || 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un puerto válido");
}
if (!process.env.AUTH_SECRET) {
  throw new Error("Falta la variable de entorno AUTH_SECRET");
}
if (!process.env.CORS_ORIGIN) {
  throw new Error("Falta la variable de entorno CORS_ORIGIN");
}

const allowedOrigins = process.env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
if (allowedOrigins.length === 0) {
  throw new Error("CORS_ORIGIN debe incluir al menos un origen permitido");
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.includes(origin));
    },
  }),
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
});
app.use("/api/auth", authRoutes);
app.use("/api/profesores", profesoresRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/materias", materiasRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/reportes", reportesRoutes);

app.use((err, _req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  if (err.code === "ER_DUP_ENTRY") {
    return res
      .status(409)
      .json({ error: "Ya existe un registro con esos datos" });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res
      .status(400)
      .json({ error: "Referencia inexistente (profesor, grupo o materia)" });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "El cuerpo JSON no es válido" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`API en puerto ${port}`);
});
