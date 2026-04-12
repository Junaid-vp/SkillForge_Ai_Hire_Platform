import { prisma } from "../Lib/prisma.js";
import Groq from "groq-sdk";
import { io } from "../../../server.js";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
export const submitAnswer = async (req, res) => {
    try {
        const { questionId, answerText, interviewId } = req.body;
        if (!questionId || !answerText) {
            return res.status(400).json({
                Message: "questionId and answerText required"
            });
        }
        // Get question
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });
        if (!question) {
            return res.status(404).json({ Message: "Question not found" });
        }
        // Evaluate with Groq AI
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content: `You are a senior software engineer evaluating
interview answers. Be fair, precise, and constructive.
Return only valid JSON. No markdown, no extra text.`
                },
                {
                    role: "user",
                    content: `Evaluate this interview answer.

Question: ${question.questionText}
Expected Answer Should Cover: ${question.expectedAnswer}
Required Keywords: ${question.keywords}
Candidate's Answer: ${answerText}

Score the answer from 0-10 based on:
- Technical accuracy (40%)
- Completeness (30%)
- Clarity (30%)

Return ONLY this JSON:
{
  "score": 7,
  "feedback": "2-3 sentences of honest constructive feedback",
  "strengths": "what they got right",
  "missing": "what they missed or got wrong",
  "recommendation": "Strong" | "Average" | "Weak"
}`
                }
            ],
            temperature: 0.2,
            max_tokens: 500
        });
        const text = response.choices[0].message.content ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        let evaluation;
        try {
            evaluation = JSON.parse(clean);
        }
        catch {
            evaluation = {
                score: 5,
                feedback: "Could not evaluate automatically",
                strengths: "",
                missing: "",
                recommendation: "Average"
            };
        }
        // Save answer to DB
        const answer = await prisma.answer.upsert({
            where: { questionId },
            create: {
                questionId,
                interviewId,
                answerText,
                score: evaluation.score,
                feedback: JSON.stringify(evaluation),
                status: "EVALUATED"
            },
            update: {
                answerText,
                score: evaluation.score,
                feedback: JSON.stringify(evaluation),
                status: "EVALUATED"
            }
        });
        io.to(interviewId).emit("answer-evaluated", {
            questionId,
            score: evaluation.score,
            feedback: evaluation.feedback,
            strengths: evaluation.strengths,
            missing: evaluation.missing,
            recommendation: evaluation.recommendation
        });
        res.status(200).json({
            data: {
                answer,
                evaluation
            },
            status: "success"
        });
    }
    catch (e) {
        res.status(500).json({ Message: "Server Error", Error: e.message });
    }
};
