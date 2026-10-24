import { pool } from "../config/database.js";

export const usuariosRepository = {
  async obtenerPorCorreo(correo) {
    const [rows] = await pool.execute(
      "SELECT id, nombre, correo, password_hash FROM usuarios WHERE correo = ?",
      [correo],
    );
    return rows[0] ?? null;
  },
};
