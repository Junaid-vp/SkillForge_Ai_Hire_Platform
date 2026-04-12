import { prisma } from "../Lib/prisma.js";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const generateQuestions = async (req, res) => {
    try {
        const hrId = req.userId;
        if (!hrId) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        const { interviewId, skills, position } = req.body;
        if (!interviewId || !skills) {
            return res.status(400).json({
                Message: "interviewId and skills required"
            });
        }
        // Check interview belongs to this HR
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
- Questions 14-15: LeetCode style logic problems (easy/medium level)
  based on their skill level

For each question provide:
- Clear question text
- What a good answer should cover (expectedAnswer)
- 3-5 keywords that must be in a good answer
- difficulty: Easy, Medium, or Hard
- isLeetcode: true only for questions 14-15

Return ONLY this JSON array:
[
  {
    "questionText": "question here",
    "expectedAnswer": "what good answer covers",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "difficulty": "Medium",
    "isLeetcode": false,
    "orderIndex": 1
  }
]`
                }
            ],
            temperature: 0.3,
            max_tokens: 3000
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
                throw new Error("AI failed to generate questions");
        }
        //  Delete old questions if regenerating
        await prisma.question.deleteMany({
            where: { interviewId }
        });
        // Save to DB
        const saved = await prisma.question.createMany({
            data: questions.map((q) => ({
                interviewId,
                questionText: q.questionText,
                expectedAnswer: q.expectedAnswer,
                keywords: q.keywords.join("|"),
                difficulty: q.difficulty,
                isLeetcode: q.isLeetcode ?? false,
                orderIndex: q.orderIndex
            }))
        });
        //  Fetch saved questions to return with IDs
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
        res.status(500).json({
            Message: "Server Error",
            Error: e.message
        });
    }
};
export const getQuestions = async (req, res) => {
    try {
        const interviewId = req.params.interviewId;
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
