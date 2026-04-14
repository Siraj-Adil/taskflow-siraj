import jwt from "jsonwebtoken";

export function generateToken(user) {
    return jwt.sign(
        {
            user_id : user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );
}
