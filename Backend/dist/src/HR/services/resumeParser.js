import { Groq } from 'groq-sdk';
import { PDFParse } from 'pdf-parse';
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});
export const parseResume = async (fileBuffer) => {
    const pdf = new PDFParse({ data: fileBuffer });
    const res = await pdf.getText();
    const resumeText = res.text;
    if (!resumeText || resumeText.trim().length === 0) {
        throw new Error("Could not extract text from PDF");
    }
    const textForDetails = resumeText.slice(0, 6000);
    const textForSummary = resumeText.slice(0, 8000);
    const detailsRespons = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `You are an expert resume parser for a 
professional hiring platform. Your job is to extract 
structured data from resumes with 100% accuracy.

RULES:
- Return ONLY a valid JSON object
- No markdown, no code blocks, no explanation
- No text before or after the JSON
- If a field cannot be found, use null
- Experience must be an integer (years only)
- Skills must be an array of individual technologies
- Position should be the most recent or target job title
- Email must be a valid email format or null`
            },
            {
                role: "user",
                content: `Parse this resume and extract the following 
fields into a JSON object.

Required JSON structure:
{
  "developerName": "candidate full name as written",
  "developerEmail": "email@example.com or null",
  "position": "most recent job title or target role",
  "experience": 3,
  "skills": [
    "React",
    "TypeScript", 
    "Node.js",
    "PostgreSQL"
  ]
}

Important extraction rules:
1. developerName: Extract exactly as written on resume
2. developerEmail: Must be a valid email, else null
3. position: Use most recent job title. If fresher, 
   use their target role from objective/summary section
4. experience: Calculate total years of work experience.
   If fresher or student, use 0
5. skills: Extract ALL technical skills mentioned anywhere 
   in resume. Include languages, frameworks, databases, 
   tools, cloud platforms. Each skill as separate string.
   Maximum 20 skills. No duplicates.

RESUME TEXT:
${textForDetails}

Return only the JSON object. Nothing else.`
            }
        ],
        temperature: 0.1,
        max_tokens: 800
    });
    const summaryResponse = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                role: "system",
                content: `You are a senior technical recruiter with 
15+ years of experience at top technology companies. 
You specialize in evaluating software engineering candidates.

Your candidate summaries are known for being:
- Accurate and factual (never exaggerate)
- Technically precise (use correct terminology)
- Balanced (mention both strengths and gaps)
- Actionable (give clear hiring signal)
- Professional (formal tone, third person)

You write summaries that help non-technical HR managers 
understand a candidate's true technical value.`
            },
            {
                role: "user",
                content: `Write a professional candidate summary 
for the following resume.

The summary will be shown to HR managers who may not 
have a technical background. Your summary helps them 
make informed interview decisions.

Structure your summary in exactly this order:

PARAGRAPH 1 — Professional Overview (2 sentences):
- Who the candidate is (name, seniority level, years of experience)
- Their primary area of expertise and current/recent role

PARAGRAPH 2 — Technical Depth (2 sentences):
- Core technical skills and technologies they are proficient in
- Specific frameworks, tools, databases, or platforms they work with

PARAGRAPH 3 — Achievements and Projects (1-2 sentences):
- Notable projects, products, or achievements from their resume
- Any measurable impact, metrics, or recognizable companies

PARAGRAPH 4 — Hiring Recommendation (1 sentence):
- Clear recommendation: Strong candidate / Good candidate / 
  Needs evaluation / Not recommended
- Brief reason for recommendation

IMPORTANT RULES:
- Write in third person only
- Be factual — only mention what is in the resume
- Do not fabricate achievements or skills
- Be honest about gaps or concerns if visible
- Keep total length between 120-180 words
- Use professional language suitable for HR documentation

RESUME TEXT:
${textForSummary}`
            }
        ],
        temperature: 0.2,
        max_tokens: 700
    });
    const detailsText = detailsRespons.choices[0].message?.content ?? "";
    const clean = detailsText.replace(/```json/gi, "").replace(/```/g, "").trim();
    let details;
    try {
        details = JSON.parse(clean);
    }
    catch (e) {
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                details = JSON.parse(clean);
            }
            catch (e) {
                throw new Error("Resume parsing failed. Please fill in the details manually.");
            }
        }
        else {
            throw new Error("Resume parsing failed. Please fill in the details manually.");
        }
    }
    const summary = summaryResponse.choices[0].message.content ?? "";
    return {
        developerName: details.developerName ?? null,
        developerEmail: details.developerEmail ?? null,
        position: details.position ?? null,
        experience: details.experience ?? 0,
        skills: details.skills ?? [],
        aiSummary: summary.trim()
    };
};
