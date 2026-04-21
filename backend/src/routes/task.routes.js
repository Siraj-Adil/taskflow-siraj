import { Router } from "express";
import { deleteTask, updateTask } from "../controllers/task.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

// Middleware to check valid JWT being sent
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs (requires authentication)
 */

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task from a project. Only authorized users (project owner or permitted members) can delete tasks.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       204:
 *         description: Task deleted successfully (no content)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - Not allowed to delete this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteTask);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Update a task
 *     description: Updates task fields. Only project owner or task assignee can update it. All fields are optional.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
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
 *     responses:
 *       200:
 *         description: Task updated successfully
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
 *         description: Validation failed (invalid fields)
 *       401:
 *         description: Unauthorized - Missing or invalid JWT token
 *       403:
 *         description: Forbidden - Not allowed to update this task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", updateTask);

export default router;
