import { Router } from "express";
import {
    apply,
    getApplications,
    updateStatus,
    getMyApps,
} from "./applications.controller.js";
import authMiddleware from "../../middleware/auth.js";
import roleMiddleware from "../../middleware/role.js";

const router = Router();

// Developer applies to a job
router.post(
    "/jobs/:id/apply",
    authMiddleware,
    roleMiddleware("DEVELOPER"),
    apply
);

// Company views applications for their job
router.get(
    "/jobs/:id/applications",
    authMiddleware,
    roleMiddleware("COMPANY"),
    getApplications
);

// Company accepts or rejects an application
router.patch(
    "/applications/:id/status",
    authMiddleware,
    roleMiddleware("COMPANY"),
    updateStatus
);

// Developer views their own applications
router.get(
    "/my-applications",
    authMiddleware,
    roleMiddleware("DEVELOPER"),
    getMyApps
);

export default router;