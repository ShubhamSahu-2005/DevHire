import "dotenv/config";
import { generateAccessToken } from "../src/utils/jwt.js";

const BASE_URL = "http://localhost:3000/api/jobs";
const AUTH_URL = "http://localhost:3000/api/auth";

async function runTests() {
    console.log("Starting Jobs API Verification Tests...\n");

    let companyToken;
    let companyId;
    let jobId;

    // 0. Register a Company User
    console.log("--- 0. Register a Company User ---");
    try {
        const registerRes = await fetch(`${AUTH_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Test Company",
                email: `test_comp_${Date.now()}@example.com`,
                password: "password123",
                role: "COMPANY"
            })
        });
        const registerData = await registerRes.json();
        if (registerData.data && registerData.data.id) {
            companyId = registerData.data.id;
            console.log(`Registered Company ID: ${companyId}`);
            companyToken = generateAccessToken({ id: companyId, role: "COMPANY" });
        } else {
            console.log(`Registration failed: ${JSON.stringify(registerData)}`);
            return;
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
        return;
    }
    console.log("\n");

    // 1. Create a Job (Company only)
    console.log("--- 1. Create a Job ---");
    try {
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${companyToken}`
            },
            body: JSON.stringify({
                title: "Backend Developer",
                description: "We need a strong Node.js backend developer",
                skills: ["Node.js", "PostgreSQL", "Redis"],
                salary: 50000,
                location: "Noida"
            })
        });
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
        if (data.success) jobId = data.data.id;
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    if (!jobId) {
        console.log("Failed to create job, skipping subsequent tests.");
        return;
    }

    // 2. Get All Jobs (Public)
    console.log("--- 2. Get All Jobs ---");
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    // 3. Get Jobs with Filters
    console.log("--- 3. Get Jobs with Filters ---");
    try {
        const response = await fetch(`${BASE_URL}?location=Noida&minSalary=30000&page=1&limit=5`);
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    // 4. Get Single Job
    console.log("--- 4. Get Single Job ---");
    try {
        const response = await fetch(`${BASE_URL}/${jobId}`);
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    // 5. Update Job (Company only)
    console.log("--- 5. Update Job ---");
    try {
        const response = await fetch(`${BASE_URL}/${jobId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${companyToken}`
            },
            body: JSON.stringify({
                salary: 60000
            })
        });
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    // 6. Delete Job (Company only)
    console.log("--- 6. Delete Job ---");
    try {
        const response = await fetch(`${BASE_URL}/${jobId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${companyToken}`
            }
        });
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

runTests();
