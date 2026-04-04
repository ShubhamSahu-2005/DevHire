import { Router } from "express";
import multer from "multer";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import asynHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.js";
import roleMiddleware from "../../middleware/role.js";

import { screenResume, generateJobDescription, generateInterviewQuestions } from "./ai.service.js";

const router = Router();

//Multer setup
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);

        } else {
            cb(new Error("Only PDF files are allowed"), false);
        }
    }
})
//resume screener

router.post("/screen-resume", authMiddleware, roleMiddleware("COMPANY"), upload.single("resume"), asynHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a PDF resume",
        })
    }
    //job desc is required  in form
    const { jobDescription } = req.body;
    if (!jobDescription) {
        return res.status(400).json({
            success: false,
            message: "Job Desc is required to compare against resume",

        })
    }
    //extract data from resume
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const resumeText = pdfData.text;
    await parser.destroy();
    if (!resumeText || resumeText.trim().length < 50) {
        return res.status(400).json(
            {
                success: false,
                message: "Could not extract text from PDF-please try a different file",

            }

        )

    }
    const result = await screenResume(resumeText, jobDescription);
    res.status(200).json({
        message: "Resume Screened successfully", data: result, success: true,
    })


}));


//JD Generator
router.post("/generate-jd", authMiddleware, roleMiddleware("COMPANY"), asynHandler(async (req, res) => {
    const { title, skills, location, salary } = req.body;
    if (!title || !skills || !location || !salary) {
        return res.status(400).json({
            success: false,
            message: "Some of the fields are Missing",
        })
    }
    const jd = await generateJobDescription(title, skills, location, salary);
    res.status(200).json({
        success: true,
        message: "Job Desc generated successfully",
        data: { jobDescription: jd },
    })

}));


//Interview Questions
router.post("/interview-questions", authMiddleware, roleMiddleware("COMPANY"), asynHandler(async (req, res) => {
    const { title, skills } = req.body;
    if (!title || !skills) {
        return res.status(400).json({
            success: false,
            message: "Title and Skills are required",

        })
    }
    const questions = await generateInterviewQuestions(title, skills);
    res.status(200).json({
        success: true,
        message: "Interview Questions generated SuccessFully",
        data: questions,
    })
}))
export default router;