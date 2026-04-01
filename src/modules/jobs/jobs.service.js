import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import db from "../../config/db.js";

import { jobs } from "./jobs.schema.js";
import redis from "../../config/redis.js";
//create job

export const createJob = async ({ companyId, title, description, skills, salary, location }) => {
    const [newJob] = await db.insert(jobs).values({ companyId, title, description, skills, salary, location, status: "OPEN" }).returning();

    const keys = await redis.keys("jobs:*");
    if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[CACHE] INVALIDATED — ${keys.length} job cache entries cleared`)
    }

    return newJob;


}



//get all jobs with filter and paginations


export const getAllJobs = async ({ location, skills, minSalary, maxSalary, page = 1, limit = 10 }) => {

    const cacheKey = `jobs:${location || "all"}:${skills || "all"}:${minSalary || 0}:${maxSalary || 999999}:page${page}:limit${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
        console.log(`[CACHE ] HIT--${cacheKey}`);
        return JSON.parse(cached);
    }
    console.log(`[CACHE] Miss-- Querying DB `)
    const filters = [eq(jobs.status, 'OPEN')];
    if (location) {
        filters.push(ilike(jobs.location, `%${location}`));



    }
    if (minSalary) {
        filters.push(gte(jobs.salary, parseInt(minSalary)));
    }
    if (maxSalary) {
        filters.push(lte(jobs.salary, parseInt(maxSalary)));
    }
    //paginations

    const offset = (page - 1) * limit;
    const allJobs = await db.select().from(jobs).where(and(...filters)).limit(parseInt(limit)).offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)` }).from(jobs).where(and(...filters));
    const result = {
        data: allJobs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(count),
            totalPages: Math.ceil(count / limit),

        }
    }
    await redis.set(cacheKey, JSON.stringify(result), "EX", 300);
    console.log(`[CACHE] set-- ${cacheKey} -TTL 300s`);
    return result;






}

// get single job

export const getJobById = async (id) => {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    if (!job) {
        const error = new Error("Job Not Found")
        error.status = 404;
        throw error;

    }
    return job;
}

//update job

export const updateJob = async (id, companyId, updates) => {
    const [existing] = await db.select().from(jobs).where(eq(jobs.id, id));
    if (!existing) {
        const error = new Error("Job not found");
        error.status = 404;
        throw error;

    }
    if (existing.companyId !== companyId) {
        const error = new Error("Forbidden --This is not your job Posting");
        error.status = 403;
        throw error;
    }
    const updated = await db.update(jobs).set(updates).where(eq(jobs.id, id)).returning();
    return updated;

}


//Delete jobs
export const deleteJob = async (id, companyId) => {
    const [existing] = await db
        .select()
        .from(jobs)
        .where(eq(jobs.id, id));

    if (!existing) {
        const error = new Error("Job not found");
        error.status = 404;
        throw error;
    }

    if (existing.companyId !== companyId) {
        const error = new Error("Forbidden — this is not your job posting");
        error.status = 403;
        throw error;
    }

    await db.delete(jobs).where(eq(jobs.id, id));
    return { message: "Job deleted successfully" };
};