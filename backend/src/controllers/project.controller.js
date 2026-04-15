import prisma from "../config/db.js";
import { projectSchema } from "../validations/project.validation.js";
import { craeteTaskSchema } from "../validations/task.validation.js";

// ROUTE GET /projects
export async function getProjects(req, res) {
    try {
        const userId = req.user.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const whereClause = {
            OR: [
                { owner_id: userId },
                {
                    tasks: {
                        some: {
                            assignee_id: userId,
                        },
                    },
                },
            ],
        };

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where: whereClause,
                orderBy: { created_at: "desc" },
                skip,
                take: limit,
            }),
            prisma.project.count({
                where: whereClause,
            }),
        ]);

        return res.status(200).json({
            projects,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE POST /projects
export async function createProject(req, res) {
    try {
        const userId = req.user.user_id;
        const body = req.body || {};
        const parsed = projectSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "validation failed",
                fields: parsed.error.flatten().fieldErrors,
            });
        }

        const { name, description } = parsed.data;

        const project = await prisma.project.create({
            data: {
                name: name,
                description: description,
                owner_id: userId,
            },
        });

        return res.status(201).json(project);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE GET /projects/:id
export async function getProjectById(req, res) {
    try {
        const userId = req.user.user_id;
        const projectId = req.params.id;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: "project not found" });
        }

        const isOwner = project.owner_id === userId;
        const isAssigned = project.tasks.some((t) => t.assignee_id === userId);

        if (!isOwner && !isAssigned) {
            return res.status(403).json({ error: "forbidden" });
        }

        return res.status(200).json({ project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE PATCH /projects/:id
export async function updateProject(req, res) {
    try {
        const userId = req.user.user_id;
        const projectId = req.params.id;
        const body = req.body || {};

        const parsed = projectSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "validation failed",
                fields: parsed.error.flatten().fieldErrors,
            });
        }

        const { name, description } = parsed.data;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: "project not found" });
        }

        const isOwner = project.owner_id === userId;

        if (!isOwner) {
            return res.status(403).json({ error: "forbidden" });
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: { name: name, description: description },
        });

        return res.status(200).json(updatedProject);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE DELETE /projects/:id
export async function deleteProject(req, res) {
    try {
        const userId = req.user.user_id;
        const projectId = req.params.id;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: "project not found" });
        }

        const isOwner = project.owner_id === userId;

        if (!isOwner) {
            return res.status(403).json({ error: "forbidden" });
        }

        // Cascade delete (first Tasks, then Project)

        await prisma.task.deleteMany({
            where: { project_id: projectId },
        });

        await prisma.project.delete({
            where: { id: projectId },
        });

        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE GET /projects/:id/tasks
export async function getTasks(req, res) {
    try {
        const userId = req.user.user_id;
        const projectId = req.params.id;
        const { status, assignee } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: "project not found" });
        }

        const isOwner = project.owner_id === userId;
        const isAssigned = project.tasks.some((t) => t.assignee_id === userId);

        if (!isOwner && !isAssigned) {
            return res.status(403).json({ error: "forbidden" });
        }

        const filters = {
            project_id: projectId,
        };

        if (status) {
            filters["status"] = status;
        }

        if (assignee) {
            filters["assignee_id"] = assignee;
        }

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where: filters,
                orderBy: { created_at: "desc" },
                skip,
                take: limit,
            }),
            prisma.task.count({
                where: filters,
            }),
        ]);

        return res.status(200).json({
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE POST /projects/:id/tasks
export async function createTask(req, res) {
    try {
        const userId = req.user.user_id;
        const projectId = req.params.id;
        const body = req.body || {};

        const parsed = craeteTaskSchema.safeParse(body);

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

        if (assigneeId) {
            const assignee = await prisma.user.findUnique({
                where: { id: assigneeId },
            });

            if (!assignee) {
                return res.status(404).json({ error: "assignee not found" });
            }
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: "project not found" });
        }

        const isOwner = project.owner_id === userId;
        const isAssigned = project.tasks.some((t) => t.assignee_id === userId);

        if (!isOwner && !isAssigned) {
            return res.status(403).json({ error: "forbidden" });
        }

        const task = await prisma.task.create({
            data: {
                title: title,
                project_id: projectId,
                description: description,
                priority: priority,
                status: status,
                assignee_id: assigneeId,
                due_date: due_date,
            },
        });

        return res.status(201).json(task);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE GET /projects/:id/stats
export async function getProjectStats(req, res) {
    try {
        const userId = req.user.user_id;
        const projectId = req.params.id;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                tasks: {
                    include: {
                        assignee: true,
                    },
                },
            },
        });

        if (!project) {
            return res.status(404).json({ error: "project not found" });
        }

        const isOwner = project.owner_id === userId;
        const isAssigned = project.tasks.some((t) => t.assignee_id === userId);

        if (!isOwner && !isAssigned) {
            return res.status(403).json({ error: "forbidden" });
        }

        const total_tasks = project.tasks.length;

        const by_status = {
            todo: 0,
            in_progress: 0,
            done: 0,
        };

        const assigneeMap = new Map();

        for (const task of project.tasks) {
            // status count
            by_status[task.status]++;

            // by assignee
            if (task.assignee_id && task.assignee) {
                const id = task.assignee_id;

                if (!assigneeMap.has(id)) {
                    assigneeMap.set(id, {
                        assignee_id: id,
                        assignee_name: task.assignee.name,
                        count: 0,
                    });
                }

                assigneeMap.get(id).count++;
            }
        }

        return res.status(200).json({
            total_tasks,
            by_status,
            by_assignee: Array.from(assigneeMap.values()),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}
