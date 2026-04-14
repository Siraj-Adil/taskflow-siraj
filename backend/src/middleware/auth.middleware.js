import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            // 401 Unauthenticated, no token provided
            return res.status(401).json({
                error: "unauthorized",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            // 401 Unauthenticated, no token provided
            return res.status(401).json({
                error: "unauthorized",
            });
        }

        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (err, decodedPayloadFromJWT) => {
                if (err) {
                    // Forbidden, invalid token
                    return res.status(403).json({
                        error: "forbidden",
                    });
                } else {
                    // Attaching user to request
                    req.user = decodedPayloadFromJWT;
                    return next();
                }
            }
        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "internal server error",
        });
    }
}
