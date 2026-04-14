import { Router } from "express";
import { deleteTask, updateTask } from "../controllers/task.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

// Middleware to check valid JWT being sent
router.use(auth);

router.delete("/:id", deleteTask);
router.patch("/:id", updateTask);

export default router;
