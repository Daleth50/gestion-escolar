import { profesoresRepository as repo } from "../repositories/profesoresRepository.js";

function validar(datos) {
  if (
    !datos ||
    typeof datos.nombre !== "string" ||
    !datos.nombre.trim() ||
    typeof datos.correo !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())
  ) {
    return "Nombre y correo válido son obligatorios";
  }
  if (
    datos.especialidad !== undefined &&
    datos.especialidad !== null &&
    typeof datos.especialidad !== "string"
  ) {
    return "La especialidad debe ser texto";
  }
  if (
    datos.estatus !== undefined &&
    datos.estatus !== "Activo" &&
    datos.estatus !== "Inactivo"
  ) {
    return "El estatus debe ser Activo o Inactivo";
  }
  return null;
}

export const profesoresController = {
  async listar(_req, res) {
    res.json(await repo.listar());
  },

  async obtener(req, res) {
    const profesor = await repo.obtener(req.params.id);
    if (!profesor) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.json(profesor);
  },

  async crear(req, res) {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });
    const profesor = await repo.crear({
      ...req.body,
      estatus: req.body.estatus ?? "Activo",
    });
    res.status(201).json(profesor);
  },

  async actualizar(req, res) {
    const error = validar(req.body);
    if (error) return res.status(400).json({ error });
    const profesor = await repo.actualizar(req.params.id, {
      ...req.body,
      estatus: req.body.estatus ?? "Activo",
    });
    if (!profesor) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.json(profesor);
  },

  async eliminar(req, res) {
    const eliminado = await repo.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Profesor no encontrado" });
    }
    res.status(204).send();
  },
};
