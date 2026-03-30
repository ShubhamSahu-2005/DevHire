import "dotenv/config";
import { generateAccessToken } from "../src/utils/jwt.js";

const BASE_URL = "http://localhost:3000/api/test/developer-only";

async function runTests() {
    console.log("Starting RBAC Verification Tests...\n");

    // Test 1: No Token
    console.log("--- Test 1: No Token ---");
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    // Test 2: Developer Token
    console.log("--- Test 2: Developer Token ---");
    const developerToken = generateAccessToken({ id: "dev-123", role: "DEVELOPER" });
    try {
        const response = await fetch(BASE_URL, {
            headers: { Authorization: `Bearer ${developerToken}` }
        });
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    console.log("\n");

    // Test 3: Company Token
    console.log("--- Test 3: Company Token ---");
    const companyToken = generateAccessToken({ id: "comp-123", role: "COMPANY" });
    try {
        const response = await fetch(BASE_URL, {
            headers: { Authorization: `Bearer ${companyToken}` }
        });
        const data = await response.json();
        console.log(`Response: ${response.status} ${JSON.stringify(data)}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

runTests();
