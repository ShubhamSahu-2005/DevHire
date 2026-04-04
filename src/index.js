import "dotenv/config";
import express from "express";
import http from "http";
import { initWebSocket } from "./config/socket.js";
import { initConsumer } from "./config/kafkaConsumer.js";
import { initProducer } from "./config/kafkaProducer.js";
import authRoutes from "./modules/auth/auth.routes.js";
import jobRoutes from "./modules/jobs/jobs.routes.js";
import applicationRoutes from "./modules/applications/applications.routes.js";
import authMiddleware from "./middleware/auth.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import profileRoutes from "./modules/profile/profile.routes.js";

import roleMiddleware from "./middleware/role.js";
import "./config/redis.js"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", applicationRoutes);
app.use("/api/ai", aiRoutes)

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
const server = http.createServer(app);
initWebSocket(server);
const startServer = async () => {
    try {
        await initProducer();
        await initConsumer();
        console.log("Kafka Initialization successful");
    } catch(e) {
        console.error("Kafka failed to start", e);
    }
}

//start Server
server.listen(PORT, () => {
    console.log(`[Server]  DevHire is running on ${PORT}`);
    console.log(`[Server ] Health Check :https://localhost:${PORT}/health`)


})
startServer()