import { prisma } from "../Lib/prisma.js";
// Save notes
export const saveNote = async (req, res) => {
    try {
        const hrId = req.userId;
        if (!hrId) {
            return res.status(401).json({ Message: "Not authorized" });
        }
        const { interviewId, content } = req.body;
        if (!interviewId || !content) {
            return res.status(400).json({
                Message: "interviewId and content required"
            });
        }
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            select: { hrId: true },
        });
        if (!interview || interview.hrId !== hrId) {
            return res.status(403).json({ Message: "Unauthorized" });
        }
        await prisma.interviewNote.upsert({
            where: { interviewId },
            create: { interviewId, hrId, content },
            update: { content }
        });
        res.status(200).json({
            Message: "Note saved",
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
// Get notes
export const getNote = async (req, res) => {
    try {
        const hrId = req.userId;
        if (!hrId) {
            return res.status(401).json({ Message: "Not authorized" });
        }
        const interviewId = req.params.interviewId;
        const interview = await prisma.interview.findUnique({
            where: { id: interviewId },
            select: { hrId: true },
        });
        if (!interview || interview.hrId !== hrId) {
            return res.status(403).json({ Message: "Unauthorized" });
        }
        const note = await prisma.interviewNote.findUnique({
            where: { interviewId }
        });
        res.status(200).json({
            data: note,
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
