import { eq, ilike, and, gte, lte, sql } from "drizzle-orm";
import db from "../../config/db.js";

import { jobs } from "./jobs.schema.js";

//create job

export const createJob = async ({ companyId, title, description, skills, salary, location }) => {
    const [newJob] = await db.insert(jobs).values({ companyId, title, description, skills, salary, location, status: "OPEN" }).returning();

    return newJob;


}



//get all jobs with filter and paginations


export const getAllJobs = async ({ location, skills, minSalary, maxSalary, page = 1, limit = 10 }) => {

}