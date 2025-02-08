const socketServer = (io) => {
  const connectedUsers = new Map();
  const activeCalls = new Map();

  io.on("connection", (socket) => {
    const user = socket.handshake.auth.user;
    console.log("User connected:", user?.username);

    // Join Room Handler
    socket.on("join room", (groupId) => {
      socket.join(groupId);
      connectedUsers.set(socket.id, { user, room: groupId });

      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      io.in(groupId).emit("users in room", usersInRoom);
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user,
      });
    });

    // Leave Room Handler
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving room:`, groupId);
      socket.leave(groupId);

      if (connectedUsers.has(socket.id)) {
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });

    // Message Handling
    socket.on("new message", (message) => {
      if (!message.groupId || !message.content) {
        return socket.emit("error", { message: "Invalid message format" });
      }
      socket.to(message.groupId).emit("message received", {
        ...message,
        timestamp: new Date().toISOString(),
      });
    });

    // Typing Indicators
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });

    // Enhanced Call Signaling
    socket.on("initiate call", ({ groupId, callerId, signal }) => {
      if (!activeCalls.has(groupId)) {
        activeCalls.set(groupId, {
          callerId,
          participants: new Set([callerId]),
          signals: { [callerId]: signal },
        });

        socket.to(groupId).emit("incoming call", {
          callerId,
          groupId,
          signal,
        });
      }
    });

    socket.on("accept call", ({ groupId, userId, signal }) => {
      const call = activeCalls.get(groupId);
      if (call) {
        call.participants.add(userId);
        call.signals[userId] = signal;

        // Notify all participants about the new connection
        io.to(groupId).emit("call update", {
          participants: Array.from(call.participants),
          signals: call.signals,
        });
      }
    });

    socket.on("reject call", ({ groupId, userId }) => {
      const call = activeCalls.get(groupId);
      if (call) {
        io.to(groupId).emit("call rejected", { userId });
        if (call.participants.size <= 1) {
          activeCalls.delete(groupId);
        }
      }
    });

    socket.on("end call", ({ groupId }) => {
      if (activeCalls.has(groupId)) {
        io.to(groupId).emit("call ended");
        activeCalls.delete(groupId);
      }
    });

    // Disconnect Handler
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);

      if (connectedUsers.has(socket.id)) {
        const userData = connectedUsers.get(socket.id);
        socket.to(userData.room).emit("user left", user?._id);
        connectedUsers.delete(socket.id);

        // Handle ongoing calls
        Array.from(activeCalls.entries()).forEach(([groupId, call]) => {
          if (call.participants.has(user?._id)) {
            io.to(groupId).emit("participant left", { userId: user?._id });
            call.participants.delete(user?._id);
            if (call.participants.size <= 1) {
              io.to(groupId).emit("call ended");
              activeCalls.delete(groupId);
            }
          }
        });
      }
    });

    // Error Handler
    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
      socket.emit("error", { message: err.message });
    });
  });
};

module.exports = socketServer;
