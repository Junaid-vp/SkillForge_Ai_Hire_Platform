import { prisma } from "../Lib/prisma.js";
const JUDGE0_URL = process.env.JUDGE0_URL;
// ── Helpers ───────────────────────────────────────────────────────────────────
const safeBase64 = (str) => {
    try {
        return Buffer.from(str, "utf-8").toString("base64"); //Convert string → bytes → Base64
    }
    catch {
        return "";
    }
};
const safeDecode = (str) => {
    if (!str)
        return "";
    try {
        return Buffer.from(str, "base64").toString("utf-8");
    }
    catch {
        return str;
    }
};
export const runCode = async (req, res) => {
    try {
        const { sourceCode, languageId, stdin = "" } = req.body;
        if (!sourceCode || !languageId) {
            return res.status(400).json({ Message: "sourceCode and languageId are required" });
        }
        if (!JUDGE0_URL) {
            return res.status(500).json({ Message: "JUDGE0_URL is not set in environment" });
        }
        // ── Step 1: Submit to Judge0 ───────────────────────────────────────────────
        const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                source_code: safeBase64(sourceCode),
                language_id: languageId,
                stdin: safeBase64(stdin),
                base64_encoded: true,
            })
        });
        if (!submitRes.ok) {
            const errText = await submitRes.text().catch(() => submitRes.statusText);
            console.error("Judge0 submit error:", errText);
            return res.status(502).json({
                Message: `Judge0 submission failed (${submitRes.status})`,
                Error: errText
            });
        }
        const submitData = await submitRes.json();
        const token = submitData?.token;
        if (!token) {
            return res.status(502).json({ Message: "No token returned from Judge0" });
        }
        // ── Step 2: Poll for result ────────────────────────────────────────────────
        // status.id: 1 = In Queue, 2 = Processing, 3+ = Done
        let result = null;
        const MAX_ATTEMPTS = 20;
        const POLL_INTERVAL_MS = 1000;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
            const pollRes = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true`, {
                headers: { "Accept": "application/json" }
            });
            if (!pollRes.ok)
                continue;
            result = await pollRes.json();
            if (result?.status?.id > 2)
                break; // execution finished
        }
        if (!result) {
            return res.status(504).json({ Message: "Timed out waiting for Judge0 result" });
        }
        // ── Step 3: Decode & respond ───────────────────────────────────────────────
        const stdout = safeDecode(result?.stdout);
        const stderr = safeDecode(result?.stderr);
        const compileOutput = safeDecode(result?.compile_output);
        const message = safeDecode(result?.message); // system-level errors
        const output = stdout || compileOutput || stderr || message || "No output";
        const error = stderr || compileOutput || "";
        return res.status(200).json({
            status: result?.status?.description ?? "Unknown",
            output,
            error,
            time: result?.time ?? "0",
            memory: result?.memory?.toString() ?? "0",
        });
    }
    catch (e) {
        console.error("runCode error:", e);
        return res.status(500).json({ Message: "Server Error", Error: e.message });
    }
};
export const submitCodeAnswer = async (req, res) => {
    try {
        const { questionId, interviewId, code, language, output, codeStatus, runCount } = req.body;
        if (!questionId || !interviewId || !code || !language) {
            return res.status(400).json({ Message: "questionId, interviewId, code, language required" });
        }
        // Upsert — update if exists, create if not
        await prisma.codeAnswer.upsert({
            where: { questionId },
            create: {
                questionId,
                interviewId,
                code,
                language,
                output: output ?? null,
                codeStatus: codeStatus ?? null,
                runCount: runCount ?? 1
            },
            update: {
                code,
                language,
                output: output ?? null,
                codeStatus: codeStatus ?? null,
                runCount: runCount ?? undefined
            }
        });
        res.status(200).json({ Message: "Code solution submitted successfully", status: "success" });
    }
    catch (e) {
        console.error("submitCodeAnswer error:", e);
        res.status(500).json({ Message: "Server Error", Error: e.message });
    }
};
