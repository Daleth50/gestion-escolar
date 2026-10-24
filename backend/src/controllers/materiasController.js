import { materiasRepository as repo } from "../repositories/materiasRepository.js";

function validar(d) {
  if (!d) return "Datos inválidos";
  const texto = v => typeof v === "string" && v.trim();
  if (!texto(d.clave) || !texto(d.nombre)) return "Clave y nombre son obligatorios";
  if (!Number.isInteger(d.creditos) || d.creditos < 1) return "Créditos inválidos";
  return null;
}

export const materiasController = {
  async listar(req, res) { res.json(await repo.listar()); },
  async obtener(req, res) {
    const item = await repo.obtener(req.params.id);
    if (!item) return res.status(404).json({ error: "Materia no encontrado" });
    res.json(item);
  },
  async crear(req, res) {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });
    res.status(201).json(await repo.crear(req.body));
  },
  async actualizar(req, res) {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });
    const item = await repo.actualizar(req.params.id, req.body);
    if (!item) return res.status(404).json({ error: "Materia no encontrado" });
    res.json(item);
  },
  async eliminar(req, res) {
    if (!(await repo.eliminar(req.params.id))) return res.status(404).json({ error: "Materia no encontrado" });
    res.status(204).send();
  }
};
