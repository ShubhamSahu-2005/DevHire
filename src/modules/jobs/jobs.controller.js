import { date } from "zod";
import asynchandler from "../../utils/asyncHandler.js";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from "./jobs.service.js";

//create job

export const create = asynchandler(async (req, res) => {
    const { title, description, skills, salary, location } = req.body;
    const companyId = req.user.id;
    const job = await createJob({ companyId, title, description, skills, salary, location });
    res.status(201).json({
        message: "Job Created successFully",
        success: true,
        data: job
    })
})
//get all jobs
export const getAll = asynchandler(async (req, res) => {
    const { location, skills, minSalary, maxSalary, page, limit } = req.query;
    const result = await getAllJobs({
        location, skills, minSalary, maxSalary, page, limit
    })
    res.status(200).json({
        success: true,
        message: "Jobs Fetched SuccessFully",
        ...result,
    })
})
//get single job

export const getOne = asynchandler(async (req, res) => {
    const { id } = req.params;
    const job = await getJobById(id);
    res.status(200).json({
        data: job,
        success: true, message: "Jobs Fteched SuccessFully",
    })
})

//update job

export const update = asynchandler(async (req, res) => {
    const { id } = req.params;
    const companyid = req.user.id;
    const updates = req.body;
    const job = await updateJob(id, companyid, updates);
    res.status(200).json({
        message: "Job updated SuccessFully", data: job, success: true,
    })
})

export const remove = asynchandler(async (req, res) => {
    const { id } = req.params;
    const companyId = req.user.id;

    const result = await deleteJob(id, companyId);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});