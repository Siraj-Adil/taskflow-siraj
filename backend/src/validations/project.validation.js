import { z } from "zod";

export const projectSchema = z.object({
    name: z.string().trim().min(1, "name is required"),
    description: z.string().optional(),
});
