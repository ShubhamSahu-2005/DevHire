import { eq, and, ne } from "drizzle-orm";
import db from "../../config/db.js"
import { applications } from "./applications.schema.js";
import { jobs } from "../jobs/jobs.schema.js";


export const applyToJob = async (jobId, developerId) => {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId))
    if (!job) {
        const error = new Error("Job Not Found");
        error.status = 404;
        throw error;

    }
    if (job.status === "CLOSED") {
        const error = new Error("This job is no longer accepting applications");
        error.status = 400;
        throw error;
    }

    const [existing] = await db.select().from(applications).where(and(eq(applications.jobId, jobId), eq(applications.developerId, developerId)));
    if (existing) {
        const error = new Error("You have already applied to this job");
        error.status = 409;
        throw error;
    }
    const [newApplication] = await db.insert(applications).values({ jobId, developerId, status: "PENDING" }).returning();
    return { application: newApplication, job };


}

export const getApplicationsForJob = async (jobId, companyId) => {

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId));
    if (!job) {
        const error = new Error("Job Not Found");
        error.status = 404;
        throw error;

    }
    if (job.companyId !== companyId) {
        const error = new Error("Forbidden -This is not Your Posting");
        error.status = 403;
        throw error;
    }
    const allApplications = await db.select().from(applications).where(eq(applications.jobId, jobId));
    return allApplications;
}

//update application status

export const updateApplicationStatus = async (applicationId, companyId, status) => {
    const [application] = await db.select().from(applications).where(eq(applications.id, applicationId));
    if (!application) {
        const error = new Error("Application Not Found");
        error.status = 404;
        throw error;
    }
    const [job] = await db.select().from(jobs).where(eq(jobs.id, application.jobId));
    if (job.companyId !== companyId) {
        const error = new Error("Forbidden --This is Not Your Job Posting");
        error.status = 403;
        throw error;


    }
    const [updated] = await db.update(applications).set({ status }).where(eq(applications.id, applicationId)).returning();
    return { application: updated, job };
}

export const getMyApplications = async (developerId) => {
    const myApplications = await db.select().from(applications).where(eq(applications.developerId, developerId));
    return myApplications;
}
