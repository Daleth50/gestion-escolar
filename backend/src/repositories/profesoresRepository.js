import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";

export const profesoresRepository = {
  async listar() {
    const [rows] = await pool.execute(
      "SELECT id, nombre, correo, especialidad, estatus FROM profesores ORDER BY nombre",
    );
    return rows;
  },

  async obtener(id) {
    const [rows] = await pool.execute(
      "SELECT id, nombre, correo, especialidad, estatus FROM profesores WHERE id = ?",
      [id],
    );
    return rows[0] ?? null;
  },

  async crear(datos) {
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO profesores (id, nombre, correo, especialidad, estatus)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        datos.nombre.trim(),
        datos.correo.trim(),
        datos.especialidad?.trim() || null,
        datos.estatus,
      ],
    );
    return this.obtener(id);
  },

  async actualizar(id, datos) {
    const [result] = await pool.execute(
      `UPDATE profesores
       SET nombre = ?, correo = ?, especialidad = ?, estatus = ?
       WHERE id = ?`,
      [
        datos.nombre.trim(),
        datos.correo.trim(),
        datos.especialidad?.trim() || null,
        datos.estatus,
        id,
      ],
    );
    if (result.affectedRows === 0) return null;
    return this.obtener(id);
  },

  async eliminar(id) {
    const [result] = await pool.execute("DELETE FROM profesores WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};
