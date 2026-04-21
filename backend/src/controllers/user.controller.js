import prisma from "../config/db.js";

export async function getUsers(req, res) {
    try {
        const users = await prisma.user.findMany({});
        return res.status(200).json({
            users,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}
