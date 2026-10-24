import { Router } from "express";
import { profesoresController as controller } from "../controllers/profesoresController.js";

const router = Router();
router.get("/", controller.listar);
router.get("/:id", controller.obtener);
router.post("/", controller.crear);
router.put("/:id", controller.actualizar);
router.delete("/:id", controller.eliminar);

export default router;
