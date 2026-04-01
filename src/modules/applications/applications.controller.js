import asyncHandler from "../../utils/asyncHandler.js";
import {
    applyToJob,
    getApplicationsForJob,
    updateApplicationStatus,
    getMyApplications,
} from "./applications.service.js";

// ── Apply to Job ───────────────────────────────────────────
export const apply = asyncHandler(async (req, res) => {
    const { id: jobId } = req.params;
    const developerId = req.user.id;

    const result = await applyToJob(jobId, developerId);

    res.status(201).json({
        success: true,
        message: "Application submitted successfully",
        data: result,
    });
});

// ── Get Applications for Job ───────────────────────────────
export const getApplications = asyncHandler(async (req, res) => {
    const { id: jobId } = req.params;
    const companyId = req.user.id;

    const result = await getApplicationsForJob(jobId, companyId);

    res.status(200).json({
        success: true,
        message: "Applications fetched successfully",
        data: result,
    });
});

// ── Update Application Status ──────────────────────────────
export const updateStatus = asyncHandler(async (req, res) => {
    const { id: applicationId } = req.params;
    const companyId = req.user.id;
    const { status } = req.body;

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Status must be ACCEPTED or REJECTED",
        });
    }

    const result = await updateApplicationStatus(
        applicationId,
        companyId,
        status
    );

    res.status(200).json({
        success: true,
        message: `Application ${status.toLowerCase()} successfully`,
        data: result,
    });
});

// ── Get My Applications ────────────────────────────────────
export const getMyApps = asyncHandler(async (req, res) => {
    const developerId = req.user.id;
    const result = await getMyApplications(developerId);

    res.status(200).json({
        success: true,
        message: "Your applications fetched successfully",
        data: result,
    });
});