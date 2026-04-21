import { Router } from "express";
import { getUsers } from "../controllers/user.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = Router();

// Middleware to check valid JWT being sent
router.use(auth);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs (requires authentication)
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users. Requires valid JWT token.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - No token provided or missing authorization header
 *       403:
 *         description: Forbidden - Invalid or expired token
 */
router.get("/", getUsers);

export default router;
