import { Router } from "express";
import {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    getTasks,
    createTask,
} from "../controllers/project.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

// Middleware to check valid JWT being sent
router.use(auth);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);
router.get("/:id/tasks", getTasks);
router.post("/:id/tasks", createTask);

export default router;
