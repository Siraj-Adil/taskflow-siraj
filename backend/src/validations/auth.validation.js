import { z } from "zod";

const email = z.email("Invalid email");
const password = z.string().min(8, "Password must be at least 8 characters");

// Register
export const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email,
    password,
});

// Login
export const loginSchema = z.object({
    email,
    password,
});
