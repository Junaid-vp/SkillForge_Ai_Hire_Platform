// socketHandler.ts — Complete with malpractice warning system
// FIX: After suspension, no more warning modals fire for HR ──────────────────
import { prisma } from "../src/HR/Lib/prisma.js";
import { setIoInstance } from "../src/HR/services/NotificationService.js";
// ─── In-memory room state ─────────────────────────────────────────────────────
const roomStates = new Map();
const roomMembers = new Map();
// ─── Malpractice tracking ─────────────────────────────────────────────────────
const hardViolationCount = new Map();
// ─── ✅ FIX: Track suspended rooms so no modals fire after suspension ─────────
const suspendedRooms = new Set();
// ─── Warning thresholds ───────────────────────────────────────────────────────
const WARN_1 = 3;
const WARN_2 = 5;
const WARN_3 = 7;
const SUSPEND = 8;
export const socketHandler = (io) => {
    setIoInstance(io);
    io.on("connection", (socket) => {
        console.log("✅ User Connected:", socket.id);
        socket.on("join-hr-notification", (hrId) => {
            socket.join(hrId);
        });
        socket.on("join-room", async (data) => {
            const { interviewId, role } = data;
            socket.join(interviewId);
            socket.to(interviewId).emit("User-Joined");
            if (role) {
                if (!roomMembers.has(interviewId))
                    roomMembers.set(interviewId, new Map());
                roomMembers.get(interviewId).set(socket.id, role);
                socket._interviewId = interviewId;
                const members = roomMembers.get(interviewId);
                const roles = new Set(Array.from(members.values()));
                if (roles.has("HR") && roles.has("Developer")) {
                    try {
                        const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
                        if (interview?.status === "SCHEDULED") {
                            await prisma.interview.update({ where: { id: interviewId }, data: { status: "STARTED" } });
                            io.to(interviewId).emit("interview-status-changed", { status: "STARTED" });
                            console.log(`✅ Interview ${interviewId} → STARTED`);
                        }
                    }
                    catch (err) {
                        console.error("Failed to update status:", err);
                    }
                }
            }
            const state = roomStates.get(interviewId);
            if (state) {
                const sentState = { ...state };
                if (state.questionStartTime && state.timeLimit !== undefined) {
                    const elapsedSec = Math.floor((Date.now() - state.questionStartTime) / 1000);
                    sentState.timeLeft = Math.max(0, state.timeLimit - elapsedSec);
                }
                socket.emit("init-room-state", sentState);
            }
        });
        socket.on("send-peer-id", (data) => {
            socket.to(data.interviewId).emit("receive-peer-id", data.peerId);
        });
        socket.on("screen-share-on", (interviewId) => socket.to(interviewId).emit("screen-share-on"));
        socket.on("screen-share-off", (interviewId) => socket.to(interviewId).emit("screen-share-off"));
        socket.on("send-screen-peer-id", (data) => {
            socket.to(data.interviewId).emit("receive-screen-peer-id", data.screenPeerId);
        });
        socket.on("screen-share-stopped", (interviewId) => {
            socket.to(interviewId).emit("screen-share-stopped");
        });
        socket.on("send-message", (data) => {
            const msg = {
                message: data.message,
                senderName: data.senderName,
                senderRole: data.senderRole,
                timestamp: new Date().toISOString()
            };
            if (!roomStates.has(data.interviewId))
                roomStates.set(data.interviewId, {});
            const state = roomStates.get(data.interviewId);
            if (!state.messages)
                state.messages = [];
            state.messages.push(msg);
            io.to(data.interviewId).emit("receive-message", msg);
        });
        socket.on("start-qa", (interviewId) => {
            if (!roomStates.has(interviewId))
                roomStates.set(interviewId, {});
            const state = roomStates.get(interviewId);
            state.qaStarted = true;
            state.activePanel = "qa";
            socket.to(interviewId).emit("qa-started");
        });
        socket.on("send-question", (data) => {
            if (!roomStates.has(data.interviewId))
                roomStates.set(data.interviewId, {});
            const state = roomStates.get(data.interviewId);
            state.currentQuestion = data;
            state.timeLimit = data.timeLimit;
            state.questionStartTime = Date.now();
            socket.to(data.interviewId).emit("receive-question", data);
        });
        socket.on("answer-submitted", (data) => {
            if (!roomStates.has(data.interviewId))
                roomStates.set(data.interviewId, {});
            const state = roomStates.get(data.interviewId);
            state.answeredQuestionId = data.questionId;
            socket.to(data.interviewId).emit("answer-submitted", data);
        });
        socket.on("open-code-editor", (data) => {
            if (!roomStates.has(data.interviewId))
                roomStates.set(data.interviewId, {});
            const state = roomStates.get(data.interviewId);
            state.showCodeEditor = true;
            state.activePanel = "qa";
            state.leetcodeData = data.questions;
            state.leetcodeStartTime = Date.now();
            socket.to(data.interviewId).emit("open-code-editor", data);
        });
        socket.on("code-result", (data) => { io.to(data.interviewId).emit("code-result", data); });
        socket.on("coding-complete", (data) => {
            if (roomStates.has(data.interviewId)) {
                const state = roomStates.get(data.interviewId);
                state.showCodeEditor = false;
                state.codingComplete = true;
            }
            socket.to(data.interviewId).emit("coding-complete", data);
        });
        // ── MALPRACTICE SYSTEM ────────────────────────────────────────────────────
        // SOFT → bell log only, no warning count, no modals
        socket.on("malpractice-soft", (data) => {
            // HR bell log
            socket.to(data.interviewId).emit("malpractice-log", { ...data, isHard: false });
            // Dev own bell log
            socket.emit("malpractice-log", { ...data, isHard: false });
            console.log(`📋 Soft [${data.severity}]: ${data.type}`);
        });
        // HARD → counts toward warnings → possible modals and suspension
        socket.on("malpractice-hard", (data) => {
            // ✅ FIX: If this room is already suspended, silently ignore
            // No more modals fire for HR after suspension
            if (suspendedRooms.has(data.interviewId)) {
                console.log(`🔇 Ignoring malpractice for suspended room: ${data.interviewId}`);
                return;
            }
            const current = hardViolationCount.get(data.interviewId) ?? 0;
            const count = current + 1;
            hardViolationCount.set(data.interviewId, count);
            // Everyone sees it in bell log
            io.to(data.interviewId).emit("malpractice-log", {
                ...data, isHard: true, warningCount: count
            });
            console.log(`🚨 Hard #${count}: ${data.type} in ${data.interviewId}`);
            // Warning modals at thresholds — both HR and Dev see them
            if (count === WARN_1) {
                io.to(data.interviewId).emit("malpractice-warning", {
                    level: 1, warningCount: count, timestamp: data.timestamp
                });
            }
            else if (count === WARN_2) {
                io.to(data.interviewId).emit("malpractice-warning", {
                    level: 2, warningCount: count, timestamp: data.timestamp
                });
            }
            else if (count === WARN_3) {
                io.to(data.interviewId).emit("malpractice-warning", {
                    level: 3, warningCount: count, timestamp: data.timestamp
                });
            }
            else if (count >= SUSPEND) {
                // Show suspend button to HR only (socket.to = everyone else in room = HR)
                socket.to(data.interviewId).emit("show-suspend-button", { warningCount: count });
            }
        });
        // HR manually clicks Suspend Interview button
        socket.on("suspend-interview", async (interviewId) => {
            // ✅ FIX: Mark room as suspended FIRST
            // Any late malpractice-hard events that arrive after this will be ignored
            suspendedRooms.add(interviewId);
            // Update DB status
            try {
                await prisma.interview.update({
                    where: { id: interviewId },
                    data: { status: "SUSPENDED" }
                });
                console.log(`🚫 Interview ${interviewId} SUSPENDED`);
            }
            catch (err) {
                console.error("Failed to suspend:", err);
            }
            // Send suspended event to developer (socket.to = everyone except HR who clicked)
            socket.to(interviewId).emit("interview-suspended");
            // Confirm back to HR
            socket.emit("interview-suspension-confirmed", { interviewId });
            // Clear violation count
            hardViolationCount.delete(interviewId);
            console.log(`✅ Room ${interviewId} marked as suspended — no more modals will fire`);
        });
        socket.on("leave-room", (interviewId) => {
            socket.leave(interviewId);
            socket.to(interviewId).emit("user-left");
        });
        socket.on("end-call-explicitly", async (interviewId) => {
            socket.to(interviewId).emit("end-call-explicitly");
            roomStates.delete(interviewId);
            roomMembers.delete(interviewId);
            hardViolationCount.delete(interviewId);
            suspendedRooms.delete(interviewId); // ✅ cleanup suspended set too
            try {
                const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
                // Don't overwrite SUSPENDED status
                if (interview?.status === "STARTED") {
                    await prisma.interview.update({
                        where: { id: interviewId },
                        data: { status: "COMPLETED" }
                    });
                    console.log(`✅ Interview ${interviewId} → COMPLETED`);
                }
            }
            catch (err) {
                console.error("Failed to complete:", err);
            }
        });
        socket.on("disconnect", () => {
            const interviewId = socket._interviewId;
            if (interviewId && roomMembers.has(interviewId)) {
                roomMembers.get(interviewId).delete(socket.id);
                if (roomMembers.get(interviewId).size === 0)
                    roomMembers.delete(interviewId);
            }
        });
    });
};
