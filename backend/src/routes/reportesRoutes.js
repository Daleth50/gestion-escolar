import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

router.get("/resumen", async (_req, res) => {
  const [rows] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM alumnos) AS totalAlumnos,
      (SELECT COUNT(*) FROM profesores) AS totalProfesores,
      (SELECT COUNT(*) FROM materias) AS totalMaterias,
      (SELECT COUNT(*) FROM grupos) AS totalGrupos
  `);
  res.json(rows[0]);
});
export default router;
