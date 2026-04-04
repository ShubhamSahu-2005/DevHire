import "dotenv/config";
import {
    getMatchScore,
    screenResume,
    generateJobDescription,
    generateInterviewQuestions
} from "./src/modules/ai/ai.service.js";

async function testAIFeatures() {
    console.log("==========================================");
    console.log("Testing AI Feature 1: getMatchScore");
    console.log("==========================================");
    try {
        const developerProfile = "Developer with 5 years experience in Node.js, Express, and PostgreSQL.";
        const jobDescription = "Looking for a backend developer with Node.js and SQL experience. Minimum 3 years of experience required.";
        const matchScore = await getMatchScore(developerProfile, jobDescription);
        console.log("Result:", JSON.stringify(matchScore, null, 2));
    } catch (error) {
        console.error("Error in getMatchScore:", error);
    }

    console.log("\n==========================================");
    console.log("Testing AI Feature 2: screenResume");
    console.log("==========================================");
    try {
        const resumeText = "Experienced Software Engineer. Skills: React, Node.js, Next.js, MongoDB. Worked at XYZ Corp for 4 years building scalable web applications. Led a team of 3 developers.";
        const jobDescForScreening = "We need a Full Stack Developer with React and Node.js. Next.js is a plus. Should have leadership experience and at least 3 years of experience.";
        const screenResult = await screenResume(resumeText, jobDescForScreening);
        console.log("Result:", JSON.stringify(screenResult, null, 2));
    } catch (error) {
        console.error("Error in screenResume:", error);
    }

    console.log("\n==========================================");
    console.log("Testing AI Feature 3: generateJobDescription");
    console.log("==========================================");
    try {
        const jd = await generateJobDescription("Senior Full Stack Developer", ["React", "Node.js", "TypeScript", "AWS"], "Remote", 150000);
        console.log("Result:\n" + jd);
    } catch (error) {
        console.error("Error in generateJobDescription:", error);
    }

    console.log("\n==========================================");
    console.log("Testing AI Feature 4: generateInterviewQuestions");
    console.log("==========================================");
    try {
        const questions = await generateInterviewQuestions("Senior Full Stack Developer", ["React", "Node.js", "TypeScript"]);
        console.log("Result:", JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error("Error in generateInterviewQuestions:", error);
    }
}

testAIFeatures().then(() => console.log("\nTests Complete.")).catch(console.error);
