import { Router } from "express";
import {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    getTasks,
    createTask,
    getProjectStats,
} from "../controllers/project.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

// Middleware to check valid JWT being sent
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs (requires authentication)
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects for the logged-in user
 *     description: Returns projects owned by or assigned to the authenticated user with pagination support
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully fetched projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projects:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
router.get("/", getProjects);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a project for the authenticated user after validating input data
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 owner_id:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation failed (invalid or missing fields)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       500:
 *         description: Internal server error
 */
router.post("/", createProject);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     description: Returns a single project and its tasks if the user is the owner or assigned to a task in the project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Successfully fetched project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     owner_id:
 *                       type: string
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - User is neither owner nor assigned to project tasks
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getProjectById);
/**
 * @swagger
 * /projects/{id}:
 *   patch:
 *     summary: Update a project
 *     description: Updates project name and description. Only the project owner can perform this action.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 owner_id:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation failed (invalid input fields)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - Only project owner can update
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes a project and all its related tasks. Only the project owner can perform this action.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       204:
 *         description: Project deleted successfully (no content)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - Only project owner can delete
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteProject);

/**
 * @swagger
 * /projects/{id}/tasks:
 *   get:
 *     summary: Get tasks for a project
 *     description: Returns tasks under a project with optional filters and pagination. Access is allowed only to project owner or assigned users.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter tasks by status
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Filter tasks by assignee user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of tasks per page
 *     responses:
 *       200:
 *         description: Successfully fetched tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - User not part of project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/tasks", getTasks);

/**
 * @swagger
 * /projects/{id}/tasks:
 *   post:
 *     summary: Create a task in a project
 *     description: Creates a new task under a project. Allowed for project owner or assigned project members.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 description: Task priority (low, medium, high)
 *               status:
 *                 type: string
 *                 description: Task status (todo, in-progress, done)
 *               assignee_id:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 project_id:
 *                   type: string
 *                 assignee_id:
 *                   type: string
 *                 due_date:
 *                   type: string
 *                   format: date-time
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation failed (missing or invalid fields)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - User not allowed to create tasks in this project
 *       404:
 *         description: Project or assignee not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/tasks", createTask);

/**
 * @swagger
 * /projects/{id}/stats:
 *   get:
 *     summary: Get project statistics
 *     description: Returns aggregated statistics for a project including task counts by status and assignee. Accessible only to project owner or assigned users.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Successfully fetched project statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_tasks:
 *                   type: integer
 *                 by_status:
 *                   type: object
 *                   properties:
 *                     todo:
 *                       type: integer
 *                     in_progress:
 *                       type: integer
 *                     done:
 *                       type: integer
 *                 by_assignee:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       assignee_id:
 *                         type: string
 *                       assignee_name:
 *                         type: string
 *                       count:
 *                         type: integer
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - User not allowed to access this project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/stats", getProjectStats);

export default router;
