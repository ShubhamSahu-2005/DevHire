import "dotenv/config";
import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import authMiddleware from "./middleware/auth.js";
import roleMiddleware from "./middleware/role.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

//Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
})
//test rbac
app.get("/api/test/developer-only", authMiddleware, roleMiddleware("DEVELOPER"), (req, res) => {
    res.json({
        success: true, message: "You are a developer", user: req.user,
    })
})

//404 handler

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,

    })
})


//Global Error Handler

app.use((err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server error"
    })
})

//start Server
app.listen(PORT, () => {
    console.log(`[Server]  DevHire is running on ${PORT}`);
    console.log(`[Server ] Health Check :https://localhost:${PORT}/health`)


})