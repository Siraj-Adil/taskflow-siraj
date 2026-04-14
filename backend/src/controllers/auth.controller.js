import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import { loginSchema, registerSchema } from "../validations/auth.validation.js";

// ROUTE POST /auth/register
export async function register(req, res) {
    try {
        const body = req.body || {};
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "validation failed",
                fields: parsed.error.flatten().fieldErrors,
            });
        }

        const { name, email, password } = parsed.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        // 409 Conflict : Request conflicts with existing resource (user).
        if (existingUser) {
            return res.status(409).json({
                error: "user already exist",
            });
        }

        // Hashing password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Creating User in DB
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // 200 OK : Everything valid (Returining token)
        return res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token: generateToken(user),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}

// ROUTE POST /auth/login
export async function login(req, res) {
    try {
        const body = req.body || {};
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                error: "validation failed",
                fields: parsed.error.flatten().fieldErrors,
            });
        }

        const { email, password } = parsed.data;

        // Checking if user exist
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                error: "user not found",
            });
        }

        // compare password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({
                error: "Unauthorized",
            });
        }

        // 200 OK : Everything valid (Returining token)
        return res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            token: generateToken(user),
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}
