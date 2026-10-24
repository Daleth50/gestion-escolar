import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";

const SELECT = `SELECT id, matricula, nombre, correo, grupo_id AS grupoId FROM alumnos`;

export const alumnosRepository = {
  async listar() {
    const [rows] = await pool.execute(`${SELECT} ORDER BY nombre`);
    return rows;
  },
  async obtener(id) {
    const [rows] = await pool.execute(`${SELECT} WHERE id = ?`, [id]);
    return rows[0] ?? null;
  },
  async crear(datos) {
    const id = randomUUID();
    await pool.execute(
      `INSERT INTO alumnos (id, matricula, nombre, correo, grupo_id) VALUES (?, ?, ?, ?, ?)`,
      [id, datos.matricula, datos.nombre, datos.correo, datos.grupoId || null]
    );
    return this.obtener(id);
  },
  async actualizar(id, datos) {
    const [result] = await pool.execute(
      `UPDATE alumnos SET matricula = ?, nombre = ?, correo = ?, grupo_id = ? WHERE id = ?`,
      [datos.matricula, datos.nombre, datos.correo, datos.grupoId || null, id]
    );
    if (result.affectedRows === 0) return null;
    return this.obtener(id);
  },
  async eliminar(id) {
    const [result] = await pool.execute("DELETE FROM alumnos WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};
