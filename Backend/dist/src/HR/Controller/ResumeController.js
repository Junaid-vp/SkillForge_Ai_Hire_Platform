import { parseResume } from "../services/resumeParser.js";
import { randomBytes } from "crypto";
import { uploadFile } from "../services/cloudinary.js";
import { prisma } from "../Lib/prisma.js";
export const parseResumeController = async (req, res) => {
    try {
        const id = req.userId;
        if (!id) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        const hr = await prisma.hR.findUnique({
            where: { id }
        });
        if (hr?.plan === "free" && (hr?.interviewCount ?? 0) >= (hr?.interviewLimit ?? 5)) {
            return res.status(403).json({
                Message: "Limit is Over Upgrade to pro",
            });
        }
        if (!req.file) {
            return res.status(400).json({ Message: "Please upload a PDF" });
        }
        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ Message: "Only PDF files allowed" });
        }
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ Message: "File size must be under 5MB" });
        }
        const data = await parseResume(req.file.buffer);
        const resumeName = `resume_${randomBytes(8).toString("hex")}`;
        const resumeUrl = await uploadFile(req.file.buffer, resumeName);
        res.status(200).json({
            data: {
                ...data,
                resumeUrl
            },
            Status: "Success"
        });
    }
    catch (e) {
        res.json({
            Message: "Server Error",
            Error: e.message
        });
    }
};
export const specificDevTotalDetails = async (req, res) => {
    try {
        const hrId = req.userId;
        const devId = req.params.id;
        if (!hrId) {
            return res.status(401).json({ Message: "HR not logged in" });
        }
        if (!devId) {
            return res.status(400).json({ Message: "Developer ID required" });
        }
        const DevDetails = await prisma.developer.findUnique({
            where: { id: devId }
        });
        if (!DevDetails) {
            return res.status(404).json({ Message: "Developer not found" });
        }
        if (DevDetails.hrId !== hrId) {
            return res.status(403).json({ Message: "Unauthorized" });
        }
        const DevInterview = await prisma.interview.findFirst({
            where: {
                developerId: devId,
                hrId: hrId
            }
        });
        const DevTask = DevInterview
            ? await prisma.task.findFirst({
                where: {
                    interviewId: DevInterview.id
                },
                include: {
                    taskLibrary: {
                        select: {
                            title: true,
                            description: true,
                            requirements: true,
                            difficulty: true,
                            duration: true,
                            category: true,
                            techStack: true
                        }
                    }
                }
            })
            : null;
        // const skills = DevDetails.skills
        //   ? DevDetails.skills.split("|")
        //   : []
        res.status(200).json({
            data: {
                developer: DevDetails ?? null,
                interview: DevInterview ?? null,
                task: DevTask ?? null
            },
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
