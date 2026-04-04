import { Router } from "express";
import { get, update } from "./profile.controller.js";
import authMiddleware from "../../middleware/auth.js";

const router = Router();

router.get("/profile", authMiddleware, get);
router.put("/profile", authMiddleware, update);

export default router;