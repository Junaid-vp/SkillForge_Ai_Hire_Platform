import { Server } from "socket.io";
import { prisma } from "../src/HR/Lib/prisma.js";
import { setIoInstance } from "../src/HR/services/NotificationService.js";

const roomStates = new Map<string, any>();
// Track who is in each room: { interviewId -> Set<"HR" | "Developer"> }
const roomMembers = new Map<string, Map<string, string>>();

export const socketHandler = (io: Server) => {
  setIoInstance(io);
  //Connected

  io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    // HR joins their private notification room
    socket.on("join-hr-notification", (hrId: string) => {
      socket.join(hrId);
      console.log(`🔔 HR ${hrId} joined their notification room`);
    });

    // Join-Interview

    socket.on(
      "join-room",
      async (data: string | { interviewId: string; role: string }) => {
        
        const { interviewId, role } = data as {
          interviewId: string;
          role: string;
        };

        socket.join(interviewId);
        socket.to(interviewId).emit("User-Joined");

        console.log(
          `User ${socket.id} joined room: ${interviewId} as ${role ?? "unknown"}`,
        );

        // Track room members by role
        if (role) {
          if (!roomMembers.has(interviewId))
            roomMembers.set(interviewId, new Map());
          roomMembers.get(interviewId)!.set(socket.id, role);

          // Store the interviewId on the socket for disconnect cleanup
          (socket as any)._interviewId = interviewId;

          // Check if both HR and Developer are now in the room
          const members = roomMembers.get(interviewId)!;
          const roles = new Set(Array.from(members.values()));
          if (roles.has("HR") && roles.has("Developer")) {
            try {
              const interview = await prisma.interview.findUnique({
                where: { id: interviewId },
              });
              if (interview && interview.status === "SCHEDULED") {
                await prisma.interview.update({
                  where: { id: interviewId },
                  data: { status: "STARTED" },
                });
                io.to(interviewId).emit("interview-status-changed", {
                  status: "STARTED",
                });
                console.log(`✅ Interview ${interviewId} marked as STARTED`);
              }
            } catch (err) {
              console.error(
                "Failed to update interview status to STARTED:",
                err,
              );
            }
          }
        }

        // Send the current room state back to the joining user immediately
        const state = roomStates.get(interviewId);
        if (state) {
          const sentState = { ...state };
          if (state.questionStartTime && state.timeLimit !== undefined) {
            const elapsedSec = Math.floor(
              (Date.now() - state.questionStartTime) / 1000,
            );
            const remaining = Math.max(0, state.timeLimit - elapsedSec);
            sentState.timeLeft = remaining;
          }
          socket.emit("init-room-state", sentState);
        }
      },
    );

    // Share PeerJS ID For Video
    socket.on(
      "send-peer-id",
      (data: { interviewId: string; peerId: string }) => {
        socket.to(data.interviewId).emit("receive-peer-id", data.peerId);
        console.log(`Peer ID shared in room: ${data.interviewId}`);
      },
    );

    //Send Message

    socket.on(
      "send-message",
      (data: {
        interviewId: string;
        message: string;
        senderName: string;
        senderRole: string;
      }) => {
        const msg = {
          message: data.message,
          senderName: data.senderName,
          senderRole: data.senderRole,
          timestamp: new Date().toISOString(),
        };

        if (!roomStates.has(data.interviewId))
          roomStates.set(data.interviewId, {});
        const state = roomStates.get(data.interviewId);
        if (!state.messages) state.messages = [];
        state.messages.push(msg);

        io.to(data.interviewId).emit("receive-message", msg);
      },
    );

    //Screen Share

    socket.on("screen-share-on", (interviewId: string) => {
      socket.to(interviewId).emit("screen-share-on");
    });

    socket.on("screen-share-off", (interviewId: string) => {
      socket.to(interviewId).emit("screen-share-off");
    });

    // Share PeerJS ID For Screen share

    socket.on(
      "send-screen-peer-id",
      (data: { interviewId: string; screenPeerId: string }) => {
        socket
          .to(data.interviewId)
          .emit("receive-screen-peer-id", data.screenPeerId);
      },
    );

    // Screen share stopped
    socket.on("screen-share-stopped", (interviewId: string) => {
      socket.to(interviewId).emit("screen-share-stopped");
    });

    // ── Q&A Events ────────────────────

    // HR starts Q&A session
    socket.on("start-qa", (interviewId: string) => {
      if (!roomStates.has(interviewId)) roomStates.set(interviewId, {});
      const state = roomStates.get(interviewId);
      state.qaStarted = true;
      state.activePanel = "qa";

      socket.to(interviewId).emit("qa-started");
    });

    // HR sends one question to developer
    socket.on(
      "send-question",
      (data: {
        interviewId: string;
        questionId: string;
        questionText: string;
        orderIndex: number;
        total: number;
        timeLimit: number; // seconds
      }) => {
        if (!roomStates.has(data.interviewId))
          roomStates.set(data.interviewId, {});
        const state = roomStates.get(data.interviewId);
        state.currentQuestion = data;
        state.timeLimit = data.timeLimit;
        state.questionStartTime = Date.now();

        socket.to(data.interviewId).emit("receive-question", data);
      },
    );

    // Developer submitted answer
    socket.on(
      "answer-submitted",
      (data: { interviewId: string; questionId: string }) => {
        if (!roomStates.has(data.interviewId))
          roomStates.set(data.interviewId, {});
        const state = roomStates.get(data.interviewId);
        state.answeredQuestionId = data.questionId;

        // Tell HR dev submitted — AI evaluating
        socket.to(data.interviewId).emit("answer-submitted", data);
      },
    );

    // ── Code Editor Events ────────────────────────────────────────────────────

    // HR opens code editor for developer — sends full LeetCode question data
    socket.on(
      "open-code-editor",
      (data: {
        interviewId: string;
        questions: {
          id: string;
          questionText: string;
          estimatedTime: number | null;
          inputExample: string | null;
          outputExample: string | null;
          constraints: string | null;
        }[];
      }) => {
        if (!roomStates.has(data.interviewId))
          roomStates.set(data.interviewId, {});
        const state = roomStates.get(data.interviewId);
        state.showCodeEditor = true;
        state.activePanel = "qa";
        state.leetcodeData = data.questions;
        state.leetcodeStartTime = Date.now();

        socket.to(data.interviewId).emit("open-code-editor", data);
        console.log(`💻 Code editor opened for room: ${data.interviewId}`);
      },
    );

    // Developer runs code — result sent to HR in real-time
    socket.on(
      "code-result",
      (data: {
        interviewId: string;
        questionId: string;
        output: string;
        status: string;
        language: string;
        time?: string;
        memory?: string;
        code?: string;
      }) => {
        // Send to everyone in room so HR sees result live
        io.to(data.interviewId).emit("code-result", data);
        console.log(
          `💡 Code result [${data.status}] from room: ${data.interviewId}`,
        );
      },
    );

    socket.on("coding-complete", (data: { interviewId: string }) => {
      if (roomStates.has(data.interviewId)) {
        const state = roomStates.get(data.interviewId);
        state.showCodeEditor = false;
        state.codingComplete = true;
      }
      socket.to(data.interviewId).emit("coding-complete", data);
      console.log(`✅ Coding complete in room: ${data.interviewId}`);
    });

    // Malpractice detection
    socket.on(
      "malpractice",
      (data: {
        interviewId: string;
        type: string;
        message: string;
        severity: string;
        timestamp: string;
      }) => {
        // Forward to HR
        socket.to(data.interviewId).emit("malpractice-alert", data);
        console.log(
          `⚠️ Malpractice [${data.severity}]: ${data.type} in room ${data.interviewId}`,
        );
      },
    );

    //Leave Room
    socket.on("leave-room", (interviewId: string) => {
      socket.leave(interviewId);
      socket.to(interviewId).emit("user-left");
      console.log(`User left room: ${interviewId}`);
    });

    socket.on("end-call-explicitly", async (interviewId: string) => {
      socket.to(interviewId).emit("end-call-explicitly");
      roomStates.delete(interviewId); // Clear session memory
      roomMembers.delete(interviewId); // Clear member tracking

      // Mark interview as COMPLETED only if it was STARTED
      try {
        const interview = await prisma.interview.findUnique({
          where: { id: interviewId },
        });
        if (interview && interview.status === "STARTED") {
          await prisma.interview.update({
            where: { id: interviewId },
            data: { status: "COMPLETED" },
          });
          console.log(`✅ Interview ${interviewId} marked as COMPLETED`);
        } else {
           console.log(`ℹ️ Interview ${interviewId} not updated to COMPLETED (status was ${interview?.status})`);
        }
      } catch (err) {
        console.error("Failed to update interview status to COMPLETED:", err);
      }

      console.log(`Call explicitly ended: ${interviewId}`);
    });

    //    Disconnect

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      // Clean up room member tracking
      const interviewId = (socket as any)._interviewId;
      if (interviewId && roomMembers.has(interviewId)) {
        roomMembers.get(interviewId)!.delete(socket.id);
        if (roomMembers.get(interviewId)!.size === 0) {
          roomMembers.delete(interviewId);
        }
      }
    });
  });
};