import { scryptSync, timingSafeEqual } from "node:crypto";
import { usuariosRepository as repo } from "../repositories/usuariosRepository.js";
import { crearToken } from "../utils/token.js";

function passwordValida(password, almacenado) {
  const [salt, hash] = almacenado.split(":");
  const esperado = Buffer.from(hash, "hex");
  const calculado = scryptSync(password, salt, esperado.length);
  return timingSafeEqual(esperado, calculado);
}

export const authController = {
  async login(req, res) {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    }
    const usuario = await repo.obtenerPorCorreo(email.trim());
    if (!usuario || !passwordValida(password, usuario.password_hash)) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }
    res.json({
      token: crearToken(usuario),
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo },
    });
  },
};
