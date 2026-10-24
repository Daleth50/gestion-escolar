import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import profesoresRoutes from "./routes/profesoresRoutes.js";
import alumnosRoutes from "./routes/alumnosRoutes.js";
import materiasRoutes from "./routes/materiasRoutes.js";
import gruposRoutes from "./routes/gruposRoutes.js";
import reportesRoutes from "./routes/reportesRoutes.js";

const app = express();
app.use(cors({ origin: (process.env.CORS_ORIGIN ?? "").split(",").map(o => o.trim()) }));
app.use(express.json());

app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok", database: "connected" });
});
app.use("/api/profesores", profesoresRoutes);
app.use("/api/alumnos", alumnosRoutes);
app.use("/api/materias", materiasRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/reportes", reportesRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ error: "Registro duplicado" });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({ error: "Referencia inexistente (profesor, grupo o materia)" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, "0.0.0.0", () => console.log(`API en puerto ${PORT}`));
