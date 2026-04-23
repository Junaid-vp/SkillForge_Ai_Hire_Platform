import { prisma } from "../Lib/prisma.js";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const generateQuestions = async (req, res) => {
    try {
        const hrId = req.userId;
        if (!hrId)
            return res.status(401).json({ Message: "HR not logged in" });
        const { interviewId, skills, position } = req.body;
        if (!interviewId || !skills || !Array.isArray(skills)) {
            return res.status(400).json({ Message: "interviewId and skills[] required" });
        }
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            include: { developer: true }
        });
        if (!interview || interview.hrId !== hrId) {
            return res.status(403).json({ Message: "Unauthorized" });
        }
        // Generate questions using Groq
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are a senior technical interviewer at a top tech company.
You create precise, fair, and challenging interview questions.
Always return valid JSON only. No markdown, no extra text.`
                },
                {
                    role: "user",
                    content: `Generate exactly 15 technical interview questions for this candidate.
 
Position: ${position}
Skills: ${skills.join(", ")}
 
Rules:
- Questions 1-10: Conceptual/theoretical questions based on their skills
- Questions 11-13: Real-world scenario questions (how would you handle...)
- Questions 14-15: LeetCode style coding problems (easy/medium level)
 
For questions 1-13 return this format:
{
  "questionText": "question here",
  "expectedAnswer": "what a good answer should cover",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "difficulty": "Medium",
  "isLeetcode": false,
  "orderIndex": 1,
  "estimatedTime": null,
  "inputExample": null,
  "outputExample": null,
  "constraints": null
}
 
For questions 14-15 ONLY return this format (must include all leetcode fields):
{
  "questionText": "Full problem description. Example: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "expectedAnswer": "Explanation of the optimal algorithm and approach",
  "keywords": ["array", "hashmap", "two-pointer"],
  "difficulty": "Medium",
  "isLeetcode": true,
  "orderIndex": 14,
  "estimatedTime": 20,
  "inputExample": "nums = [2,7,11,15], target = 9",
  "outputExample": "[0,1]",
  "constraints": "2 <= nums.length <= 10^4\\n-10^9 <= nums[i] <= 10^9\\nOnly one valid answer exists."
}
 
estimatedTime:
- Easy problem = 15 minutes
- Medium problem = 20-25 minutes
- Hard problem = 30 minutes
 
Return ONLY a valid JSON array of exactly 15 objects. No markdown. No extra text.`
                }
            ],
            temperature: 0.1,
            max_tokens: 4000
        });
        const text = response.choices[0].message.content ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        let questions;
        try {
            questions = JSON.parse(clean);
        }
        catch {
            const match = clean.match(/\[[\s\S]*\]/);
            if (match)
                questions = JSON.parse(match[0]);
            else
                throw new Error("AI failed to generate valid JSON. Please try again.");
        }
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("AI returned empty or invalid question list.");
        }
        // Delete old questions if regenerating
        await prisma.question.deleteMany({ where: { interviewId } });
        // Save to DB with all fields
        await prisma.question.createMany({
            data: questions.map((q, i) => ({
                interviewId,
                questionText: q.questionText ?? "",
                expectedAnswer: q.expectedAnswer ?? "",
                keywords: Array.isArray(q.keywords) ? q.keywords.join("|") : (q.keywords ?? ""),
                difficulty: q.difficulty ?? "Medium",
                isLeetcode: q.isLeetcode ?? false,
                orderIndex: q.orderIndex ?? (i + 1),
                estimatedTime: q.estimatedTime ?? null,
                inputExample: q.inputExample ?? null,
                outputExample: q.outputExample ?? null,
                constraints: q.constraints ?? null,
            }))
        });
        // Fetch saved questions to return with IDs
        const savedQuestions = await prisma.question.findMany({
            where: { interviewId },
            orderBy: { orderIndex: "asc" }
        });
        res.status(201).json({
            data: savedQuestions,
            count: savedQuestions.length,
            status: "success"
        });
    }
    catch (e) {
        console.error("generateQuestions error:", e);
        res.status(500).json({ Message: "Server Error", Error: e.message });
    }
};
export const getQuestions = async (req, res) => {
    try {
        const hrId = req.userId;
        if (!hrId)
            return res.status(401).json({ Message: "HR not logged in" });
        const interviewId = req.params.interviewId;
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            select: { hrId: true },
        });
        if (!interview || interview.hrId !== hrId) {
            return res.status(403).json({ Message: "Unauthorized" });
        }
        const questions = await prisma.question.findMany({
            where: { interviewId },
            include: { answer: true },
            orderBy: { orderIndex: "asc" }
        });
        res.status(200).json({
            data: questions,
            status: "success"
        });
    }
    catch (e) {
        res.status(500).json({ Message: "Server Error", Error: e.message });
    }
};
