const roleMiddleware = (...allowedRole) => {

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
            })
        }
        if (!allowedRole.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied only ${allowedRole.join(" or ")} can do this`,
                success: false,
            })
        }
        next();
    }
}
export default roleMiddleware;