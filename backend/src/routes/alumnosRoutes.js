import { Router } from "express";
import { alumnosController as c } from "../controllers/alumnosController.js";
const router = Router();
router.get("/", c.listar);
router.get("/:id", c.obtener);
router.post("/", c.crear);
router.put("/:id", c.actualizar);
router.delete("/:id", c.eliminar);
export default router;
