//base function to call GROQ API 
const callGroq = async (prompt) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,

        },
        body: JSON.stringify({
            model: process.env.GROQ_MODEL,
            messages: [{ role: "user", content: prompt }], temperature: 0.7,
            max_tokens: 1000,

        })
    });
    //Rate Limiting
    if (response.status === 429) {
        const error = new Error("AI service is busy--Please try again in a moment");
        error.status = 429;
        throw error;
    }
    if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error:", response.status, errorText);
        const error = new Error("AI Service unavailable--Please Try again..");
        error.status = 500;
        throw error;
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

//Feature 1: Job Match Score
export const getMatchScore = async (developerProfile, jobDescription) => {
    const prompt = `
    You are an expert technical recruiter. Compare this developer profile with the job description and return a JSON object only — no extra text, no markdown, just raw JSON.

Developer Profile:
${developerProfile}

Job Description:
${jobDescription}

Return exactly this JSON structure:
{
  "matchScore": <number between 0 and 100>,
  "strengths": "<what matches well>",
  "gaps": "<what is missing>",
  "recommendation": "<one actionable tip for the developer>"
}
    
    `;
    const result = await callGroq(prompt);
    try {
        const cleaned = result
            .replace(/```(?:json)?\s*/gi, "")
            .replace(/```/g, "")
            .trim();
        return JSON.parse(cleaned);

    } catch (error) {
        return {
            matchScore: 70,
            strengths: "Strong Backend Experience",
            gaps: "Unable to fully analyse -please try again",
            recommendation: "Highlight your most relevant projects",

        }

    }
}

// ── Feature 2: Resume Screener (compared against job) ─────
export const screenResume = async (resumeText, jobDescription) => {
    const prompt = `
You are a senior technical recruiter. Compare this resume against the job description and return a JSON object only — no extra text, no markdown, just raw JSON.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return exactly this JSON structure:
{
  "extractedSkills": ["skill1", "skill2"],
  "yearsOfExperience": "<estimated years>",
  "keyProjects": ["project1", "project2"],
  "experienceLevel": "Fresher | Junior | Mid | Senior",
  "matchedSkills": ["skills from resume that match job requirements"],
  "missingSkills": ["skills required by job but missing from resume"],
  "matchScore": <number between 0 and 100>,
  "recommendation": "Hire | Maybe | Pass",
  "reasoning": "<2-3 sentence explanation based on job fit specifically>"
}
`;

    const result = await callGroq(prompt);

    try {
        const cleaned = result.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        return {
            extractedSkills: [],
            yearsOfExperience: "Unknown",
            keyProjects: [],
            experienceLevel: "Unknown",
            matchedSkills: [],
            missingSkills: [],
            matchScore: 0,
            recommendation: "Maybe",
            reasoning: "Unable to fully analyze — please try again",
        };
    }
};
//Feature 3: JD Generator
export const generateJobDescription = async (title, skills, location, salary) => {
    const prompt = `
You are an expert technical recruiter. Write a professional job description for this role. Return plain text only — no JSON, no markdown headers.

Role: ${title}
Required Skills: ${skills.join(", ")}
Location: ${location}
Salary: ₹${salary}/month

Write a complete job description with: company intro (2 lines), role overview (2 lines), key responsibilities (5 bullet points), required skills (4-5 bullet points), and what we offer (3 bullet points). Keep it professional and concise.
`;
    const result = await callGroq(prompt);
    return result.trim();

}
// Feature 4 : Interview Question Generator
export const generateInterviewQuestions = async (title, skills) => {
    const prompt = `
You are a senior technical interviewer. Generate interview questions for this role. Return a JSON array only — no extra text, no markdown, just raw JSON.

Role: ${title}
Skills: ${skills.join(", ")}

Return exactly this JSON structure:
{
  "technical": [
    {"question": "<question>", "difficulty": "Easy|Medium|Hard", "skill": "<which skill this tests>"},
    {"question": "<question>", "difficulty": "Easy|Medium|Hard", "skill": "<which skill this tests>"},
    {"question": "<question>", "difficulty": "Easy|Medium|Hard", "skill": "<which skill this tests>"}
  ],
  "conceptual": [
    {"question": "<question>", "topic": "<topic>"},
    {"question": "<question>", "topic": "<topic>"}
  ],
  "behavioral": [
    {"question": "<question>"},
    {"question": "<question>"}
  ]
}
`;

    const result = await callGroq(prompt);

    try {
        const cleaned = result.replace(/```json|```/g, "").trim();
        return JSON.parse(cleaned);
    } catch {
        return {
            technical: [],
            conceptual: [],
            behavioral: [],
        };
    }
};