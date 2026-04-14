import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("password123", 12);

    const user = await prisma.user.upsert({
        where: { email: "test@example.com" },
        update: {},
        create: {
            name: "Test User",
            email: "test@example.com",
            password: hashedPassword,
        },
    });

    let project = await prisma.project.findFirst({
        where: { owner_id: user.id },
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                name: "Test Project",
                description: "Seed project",
                owner_id: user.id,
            },
        });
    }

    const existingTasks = await prisma.task.count({
        where: { project_id: project.id },
    });

    if (existingTasks === 0) {
        await prisma.task.createMany({
            data: [
                {
                    title: "Todo task",
                    status: "todo",
                    priority: "low",
                    project_id: project.id,
                    assignee_id: user.id,
                },
                {
                    title: "In progress task",
                    status: "in_progress",
                    priority: "medium",
                    project_id: project.id,
                    assignee_id: user.id,
                },
                {
                    title: "Done task",
                    status: "done",
                    priority: "high",
                    project_id: project.id,
                    assignee_id: user.id,
                },
            ],
        });
    }

    console.log("Seed completed safely");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
