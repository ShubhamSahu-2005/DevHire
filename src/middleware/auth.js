import { verifyAccessToken } from "../utils/jwt.js";

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access Token missing or malformed",
                success: false,
            })
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();

    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired Access Token",
            success: false,
        })

    }
};

export default authMiddleware;
