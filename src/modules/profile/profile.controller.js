import asyncHandler from "../../utils/asyncHandler.js";
import { getProfile, updateProfile } from "./profile.service.js";

export const get = asyncHandler(async (req, res) => {
    const profile = await getProfile(req.user.id);
    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: profile,
    });
});

export const update = asyncHandler(async (req, res) => {
    const { name, skills, bio } = req.body;
    const updated = await updateProfile(req.user.id, { name, skills, bio });
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
    });
});