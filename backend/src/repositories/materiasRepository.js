import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";

const SELECT = `SELECT id, clave, nombre, creditos, profesor_id AS profesorId FROM materias`;

export const materiasRepository = {
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
      `INSERT INTO materias (id, clave, nombre, creditos, profesor_id) VALUES (?, ?, ?, ?, ?)`,
      [id, datos.clave, datos.nombre, datos.creditos, datos.profesorId || null]
    );
    return this.obtener(id);
  },
  async actualizar(id, datos) {
    const [result] = await pool.execute(
      `UPDATE materias SET clave = ?, nombre = ?, creditos = ?, profesor_id = ? WHERE id = ?`,
      [datos.clave, datos.nombre, datos.creditos, datos.profesorId || null, id]
    );
    if (result.affectedRows === 0) return null;
    return this.obtener(id);
  },
  async eliminar(id) {
    const [result] = await pool.execute("DELETE FROM materias WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};
