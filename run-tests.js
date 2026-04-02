import 'dotenv/config';
import jwt from 'jsonwebtoken';
import db from './src/config/db.js';
import { users } from './src/config/schema.js';
import { jobs } from './src/modules/jobs/jobs.schema.js';
import { eq } from 'drizzle-orm';

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    });
};

async function runTests() {
    console.log("Fetching Dev and Company from DB...");
    const allUsers = await db.select().from(users);
    const developer = allUsers.find(u => u.role === 'DEVELOPER');
    const company = allUsers.find(u => u.role === 'COMPANY');

    if (!developer || !company) {
        console.error("Missing developer or company user.");
        process.exit(1);
    }

    const developerToken = generateAccessToken({ id: developer.id, role: developer.role });
    const companyToken = generateAccessToken({ id: company.id, role: company.role });

    console.log(`Developer Token: ${developerToken.substring(0, 20)}...`);
    console.log(`Company Token: ${companyToken.substring(0, 20)}...`);

    console.log("Creating a new job for the test...");
    const [job] = await db.insert(jobs).values({
        title: "Test Job " + Date.now(),
        description: "Fresh test job",
        skills: ["Node.js", "React"],
        location: "Remote",
        salary: 150000,
        companyId: company.id,
        status: "OPEN"
    }).returning();
    
    console.log(`Job ID: ${job.id}`);

    console.log("\n------------ TEST 1: Developer Applies ------------");
    const applyRes = await fetch(`http://localhost:3000/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${developerToken}` }
    });
    
    const applyData = await applyRes.json();
    console.log("Response:", applyData);
    
    let applicationId = applyData.data?.application?.id;
    if (!applicationId) {
        console.log("Could not find application in response, fetching from DB...");
        const { applications } = await import('./src/modules/applications/applications.schema.js');
        const { and } = await import('drizzle-orm');
        const [app] = await db.select().from(applications).where(
            and(eq(applications.jobId, job.id), eq(applications.developerId, developer.id))
        );
        if (app) applicationId = app.id;
    }
    if (!applicationId) {
        console.error("Could not find application.");
        process.exit(1);
    }
    console.log(`Application ID: ${applicationId}`);

    // Wait briefly so emails might be logged by consumer
    await new Promise(r => setTimeout(r, 2000));

    console.log("\n------------ TEST 2: Company Accepts ------------");
    const acceptRes = await fetch(`http://localhost:3000/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { 
            "Authorization": `Bearer ${companyToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "ACCEPTED" })
    });

    const acceptData = await acceptRes.json();
    console.log("Response:", acceptData);
    
    // Wait briefly for consumer
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("\nDone Tests.");
    process.exit(0);
}

runTests();
