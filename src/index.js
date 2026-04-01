import "dotenv/config";
import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import jobRoutes from "./modules/jobs/jobs.routes.js";
import applicationRoutes from "./modules/applications/applications.routes.js";
import authMiddleware from "./middleware/auth.js";
import roleMiddleware from "./middleware/role.js";
import "./config/redis.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", applicationRoutes);

//Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    })
})
app.use("/api/jobs", jobRoutes);

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