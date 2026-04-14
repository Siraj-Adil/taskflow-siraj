import { z } from "zod";

const description = z.string().optional();
const priority = z.enum(["low", "medium", "high"]).optional();
const status = z.enum(["todo", "in_progress", "done"]).optional();
const assignee_id = z.uuid().optional();
const due_date = z.coerce.date().optional();

export const craeteTaskSchema = z.object({
    title: z.string().trim().min(1, "title is required"),
    description,
    priority,
    status,
    assignee_id,
    due_date,
});

export const updateTaskSchema = z.object({
    title: z.string().min(1, "title is required").optional(),
    description,
    priority,
    status,
    assignee_id,
    due_date,
});
