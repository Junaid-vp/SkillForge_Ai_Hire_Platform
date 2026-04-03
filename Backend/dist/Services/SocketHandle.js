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
