import { eq, and, ne } from "drizzle-orm";
import { notifyCompany } from "../../config/socket.js";
import db from "../../config/db.js"
import { applications } from "./applications.schema.js";
import { jobs } from "../jobs/jobs.schema.js";
import { users } from "../auth/auth.schema.js";
import { getMatchScore } from "../ai/ai.service.js";
import { publishMessage, TOPICS } from "../../config/kafkaProducer.js";


export const applyToJob = async (jobId, developerId) => {
    // 1. Check job exists and is open
    const [job] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, jobId));

    if (!job) {
        const error = new Error("Job not found");
        error.status = 404;
        throw error;
    }

    if (job.status === "CLOSED") {
        const error = new Error("This job is no longer accepting applications");
        error.status = 400;
        throw error;
    }

    // 2. Check already applied
    const [existing] = await db
        .select()
        .from(applications)
        .where(
            and(
                eq(applications.jobId, jobId),
                eq(applications.developerId, developerId)
            )
        );

    if (existing) {
        const error = new Error("You have already applied to this job");
        error.status = 409;
        throw error;
    }

    // 3. Get developer WITH their actual skills
    const [developer] = await db
        .select()
        .from(users)
        .where(eq(users.id, developerId));

    // 4. Build developer profile — now with REAL skills
    const developerProfile = `
    Name: ${developer.name}
    Skills: ${developer.skills && developer.skills.length > 0
            ? developer.skills.join(", ")
            : "No skills listed yet"
        }
    Bio: ${developer.bio || "No bio provided"}
  `;

    // 5. Build job description
    const jobDescription = `
    Title: ${job.title}
    Description: ${job.description}
    Required Skills: ${job.skills.join(", ")}
    Location: ${job.location}
    Salary: ₹${job.salary}/month
  `;

    // 6. Get AI match score — now accurate because skills are real
    const aiResult = await getMatchScore(developerProfile, jobDescription);
    const matchScore = aiResult.matchScore;

    // 7. Insert application with match score
    const [newApplication] = await db
        .insert(applications)
        .values({
            jobId,
            developerId,
            status: "PENDING",
            matchScore,
        })
        .returning();

    // 8. WebSocket + Kafka notifications
    notifyCompany(job.companyId, {
        type: "NEW_APPLICATION",
        message: `${developer.name} applied for ${job.title}`,
        applicantName: developer.name,
        jobTitle: job.title,
        applicationId: newApplication.id,
        matchScore,
        timestamp: new Date().toISOString(),
    });

    await publishMessage(TOPICS.APPLICATION_SUBMITTED, {
        companyId: job.companyId,
        developerName: developer.name,
        jobTitle: job.title,
    });

    return {
        application: newApplication,
        job,
        aiAnalysis: aiResult,
    };
};

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
    const [developer] = await db.select().from(users).where(eq(users.id, application.developerId));
    const [company] = await db.select().from(users).where(eq(users.id, job.companyId));
    await publishMessage(TOPICS.APPLICATION_STATUS_UPDATED, {
        developerId: application.developerId,
        jobTitle: job.title,
        status,
        companyName: company.name
    })
    return { application: updated, job };
}

export const getMyApplications = async (developerId) => {
    const myApplications = await db.select().from(applications).where(eq(applications.developerId, developerId));
    return myApplications;
}
