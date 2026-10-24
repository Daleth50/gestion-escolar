import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";

const SELECT = `
  SELECT g.id, g.clave, g.semestre, g.ciclo_escolar AS cicloEscolar,
         COALESCE(JSON_ARRAYAGG(gm.materia_id), JSON_ARRAY()) AS materiaIds
  FROM grupos g
  LEFT JOIN grupo_materias gm ON gm.grupo_id = g.id`;

// JSON_ARRAYAGG devuelve [null] cuando no hay materias
const limpiar = g => ({ ...g, materiaIds: (g.materiaIds ?? []).filter(Boolean) });

async function asignarMaterias(conn, grupoId, materiaIds = []) {
  await conn.execute("DELETE FROM grupo_materias WHERE grupo_id = ?", [grupoId]);
  for (const materiaId of new Set(materiaIds)) {
    await conn.execute(
      "INSERT INTO grupo_materias (grupo_id, materia_id) VALUES (?, ?)",
      [grupoId, materiaId]
    );
  }
}

async function enTransaccion(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export const gruposRepository = {
  async listar() {
    const [rows] = await pool.execute(`${SELECT} GROUP BY g.id ORDER BY g.clave`);
    return rows.map(limpiar);
  },
  async obtener(id) {
    const [rows] = await pool.execute(`${SELECT} WHERE g.id = ? GROUP BY g.id`, [id]);
    return rows[0] ? limpiar(rows[0]) : null;
  },
  async crear(datos) {
    const id = randomUUID();
    await enTransaccion(async conn => {
      await conn.execute(
        `INSERT INTO grupos (id, clave, semestre, ciclo_escolar) VALUES (?, ?, ?, ?)`,
        [id, datos.clave, datos.semestre, datos.cicloEscolar]
      );
      await asignarMaterias(conn, id, datos.materiaIds);
    });
    return this.obtener(id);
  },
  async actualizar(id, datos) {
    const existe = await enTransaccion(async conn => {
      const [result] = await conn.execute(
        `UPDATE grupos SET clave = ?, semestre = ?, ciclo_escolar = ? WHERE id = ?`,
        [datos.clave, datos.semestre, datos.cicloEscolar, id]
      );
      if (result.affectedRows === 0) {
        const [rows] = await conn.execute("SELECT 1 FROM grupos WHERE id = ?", [id]);
        if (rows.length === 0) return false;
      }
      await asignarMaterias(conn, id, datos.materiaIds);
      return true;
    });
    return existe ? this.obtener(id) : null;
  },
  async eliminar(id) {
    const [result] = await pool.execute("DELETE FROM grupos WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
};
