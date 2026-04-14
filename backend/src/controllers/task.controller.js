import prisma from "../config/db.js";
import { updateTaskSchema } from "../validations/task.validation.js";

// ROUTE UPDATE /projects/:id
export async function updateTask(req, res) {
    try {
        const userId = req.user.user_id;
        const taskId = req.params.id;
        const body = req.body || {};

        const parsed = updateTaskSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "validation failed",
                fields: parsed.error.flatten().fieldErrors,
            });
        }

        const {
            title,
            description,
            priority,
            status,
            assignee_id: assigneeId,
            due_date,
        } = parsed.data;

        // Finding task and its parent project
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: true,
            },
        });

        if (!task) {
            return res.status(404).json({
                error: "task not found",
            });
        }

        // Authorization check
        const isOwner = task.project.owner_id === userId;
        const isAssignee = task.assignee_id === userId;

        if (!isOwner && !isAssignee) {
            return res.status(403).json({
                error: "forbidden",
            });
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                title: title,
                description: description,
                priority: priority,
                status: status,
                assignee_id: assigneeId,
                due_date: due_date,
            },
        });

        return res.status(200).json(updatedTask);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE DELETE /projects/:id
export async function deleteTask(req, res) {
    try {
        const userId = req.user.user_id;
        const taskId = req.params.id;

        // Finding task and its parent project
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: true,
            },
        });

        if (!task) {
            return res.status(404).json({
                error: "task not found",
            });
        }

        // Authorization check
        const isOwner = task.project.owner_id === userId;
        const isAssignee = task.assignee_id === userId;

        if (!isOwner && !isAssignee) {
            return res.status(403).json({
                error: "forbidden",
            });
        }

        await prisma.task.delete({
            where: { id: taskId },
        });

        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}
