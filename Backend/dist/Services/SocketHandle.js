export const socketHandler = (io) => {
    //Connected
    io.on("connection", (socket) => {
        console.log("User Connected", socket.id);
        // Join-Interview
        socket.on("join-room", (interviewId) => {
            (socket.join(interviewId), socket.to(interviewId).emit("User-Joined"));
            console.log(`User ${socket.id} joined room: ${interviewId}`);
        });
        // Share PeerJS ID For Video
        socket.on("send-peer-id", (data) => {
            socket.to(data.interviewId).emit("receive-peer-id", data.peerId);
            console.log(`Peer ID shared in room: ${data.interviewId}`);
        });
        //Send Message
        socket.on("send-message", (data) => {
            io.to(data.interviewId).emit("receive-message", {
                message: data.message,
                senderName: data.senderName,
                senderRole: data.senderRole,
                timestamp: new Date().toISOString(),
            });
        });
        //Screen Share
        socket.on("screen-share-on", (interviewId) => {
            socket.to(interviewId).emit("screen-share-on");
        });
        socket.on("screen-share-off", (interviewId) => {
            socket.to(interviewId).emit("screen-share-off");
        });
        // Share PeerJS ID For Screen share
        socket.on("send-screen-peer-id", (data) => {
            socket
                .to(data.interviewId)
                .emit("receive-screen-peer-id", data.screenPeerId);
        });
        // Screen share stopped
        socket.on("screen-share-stopped", (interviewId) => {
            socket.to(interviewId).emit("screen-share-stopped");
        });
        // ── Q&A Events ────────────────────
        // HR starts Q&A session
        socket.on("start-qa", (interviewId) => {
            socket.to(interviewId).emit("qa-started");
        });
        // HR sends one question to developer
        socket.on("send-question", (data) => {
            socket.to(data.interviewId).emit("receive-question", data);
        });
        // Developer submitted answer
        socket.on("answer-submitted", (data) => {
            // Tell HR dev submitted — AI evaluating
            socket.to(data.interviewId).emit("answer-submitted", data);
        });
        // ── Code Editor Events ────────────
        // HR opens code editor for developer
        socket.on("open-code-editor", (data) => {
            // Send to developer with the 2 leetcode questions
            socket.to(data.interviewId).emit("open-code-editor", data);
        });
        // Developer code executed — result to HR
        socket.on("code-result", (data) => {
            // Send to everyone in room including HR
            io.to(data.interviewId).emit("code-result", data);
        });
        // Malpractice detection
        socket.on("malpractice", (data) => {
            // Forward to HR
            socket.to(data.interviewId).emit("malpractice-alert", data);
            console.log(`⚠️ Malpractice [${data.severity}]: ${data.type} in room ${data.interviewId}`);
        });
        //Leave Room
        socket.on("leave-room", (interviewId) => {
            socket.leave(interviewId);
            socket.to(interviewId).emit("user-left");
            console.log(`User left room: ${interviewId}`);
        });
        //    Disconnect
        socket.on("disconnect", () => {
            console.log("❌ User disconnected:", socket.id);
        });
    });
};
