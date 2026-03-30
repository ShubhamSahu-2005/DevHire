import { Router } from "express";
import { create, getAll, getOne, update, remove } from "./jobs.controller.js";
import authMiddleware from "../../middleware/auth.js";
import roleMiddleware from "../../middleware/role.js";

const router = Router();

// Public — anyone can browse jobs
router.get("/", getAll);
router.get("/:id", getOne);

// Company only — protected routes
router.post("/",
    authMiddleware,
    roleMiddleware("COMPANY"),
    create
);

router.put("/:id",
    authMiddleware,
    roleMiddleware("COMPANY"),
    update
);

router.delete("/:id",
    authMiddleware,
    roleMiddleware("COMPANY"),
    remove
);

export default router;