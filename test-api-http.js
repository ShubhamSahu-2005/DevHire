import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { generateAccessToken } from './src/utils/jwt.js';
import db from './src/config/db.js';
import { users } from './src/modules/auth/auth.schema.js';
import { jobs } from './src/modules/jobs/jobs.schema.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
    try {
        console.log("Preparing DB data for tests...");
        
        let developer = await db.query.users.findFirst({ where: eq(users.role, "DEVELOPER") });
        if (!developer) {
            [developer] = await db.insert(users).values({
                name: "Test Dev",
                email: "testdev@test.com",
                passwordHash: "123456",
                role: "DEVELOPER",
                skills: ["Node.js", "PostgreSQL", "React"]
            }).returning();
        }

        let company = await db.query.users.findFirst({ where: eq(users.role, "COMPANY") });
        if (!company) {
            [company] = await db.insert(users).values({
                name: "Test Company",
                email: "testcomp@test.com",
                passwordHash: "123456",
                role: "COMPANY"
            }).returning();
        }

        let job = await db.query.jobs.findFirst();
        if (!job) {
            [job] = await db.insert(jobs).values({
                title: "Backend Developer",
                description: "Good role",
                skills: ["Node.js", "PostgreSQL", "Redis"],
                location: "Noida",
                salary: 50000,
                companyId: company.id,
                status: "OPEN"
            }).returning();
        }

        const devToken = generateAccessToken(developer);
        const compToken = generateAccessToken(company);

        console.log("Using Company Token:", compToken.slice(0, 15) + "...");
        console.log("Using Developer Token:", devToken.slice(0, 15) + "...");

        console.log("\n==========================================");
        console.log("Test 1 — JD Generator");
        console.log("POST http://localhost:3000/api/ai/generate-jd");
        
        let res1 = await fetch("http://localhost:3000/api/ai/generate-jd", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${compToken}`
            },
            body: JSON.stringify({
                title: "Backend Developer",
                skills: ["Node.js", "PostgreSQL", "Redis"],
                location: "Noida",
                salary: 50000
            })
        });
        console.log("Status:", res1.status);
        console.log(await res1.json());


        console.log("\n==========================================");
        console.log("Test 2 — Interview Questions");
        console.log("POST http://localhost:3000/api/ai/interview-questions");
        let res2 = await fetch("http://localhost:3000/api/ai/interview-questions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${compToken}`
            },
            body: JSON.stringify({
                title: "Backend Developer",
                skills: ["Node.js", "PostgreSQL", "Redis", "Kafka"]
            })
        });
        console.log("Status:", res2.status);
        console.log(await res2.json());


        console.log("\n==========================================");
        console.log(`Test 3 — Apply with AI Match Score (Job ID: ${job.id})`);
        console.log(`POST http://localhost:3000/api/jobs/${job.id}/apply`);
        let res3 = await fetch(`http://localhost:3000/api/jobs/${job.id}/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${devToken}`
            }
        });
        console.log("Status:", res3.status);
        let text3 = await res3.text();
        try {
            console.log(JSON.parse(text3));
        } catch (e) { console.log(text3) }

        console.log("\n==========================================");
        console.log("Test 4 — Resume Screener");
        console.log("POST http://localhost:3000/api/ai/screen-resume");
        
        // create a dummy PDF file for testing
        const pdfContent = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" + 
            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" + 
            "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n" + 
            "4 0 obj\n<< /Length 53 >>\nstream\nBT /F1 24 Tf 100 700 Td (This is a dummy resume containing React Node.js AWS SQL experience) Tj ET\nendstream\nendobj\n" + 
            "xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000257 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n360\n%%EOF");
        
        fs.writeFileSync(path.join(__dirname, "dummy_resume.pdf"), pdfContent);
        
        const fd = new FormData();
        fd.append("jobDescription", "Need a Backend dev with AWS, Node, and SQL skills");
        fd.append("resume", new Blob([pdfContent], { type: "application/pdf" }), "dummy_resume.pdf");

        let res4 = await fetch("http://localhost:3000/api/ai/screen-resume", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${compToken}`
            },
            body: fd
        });
        console.log("Status:", res4.status);
        console.log(await res4.json());

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
runTests();
