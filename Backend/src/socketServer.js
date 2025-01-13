const socketIo = (io) => {
  const connectedUsers = new Map();

  io.on("connection", (socket) => {
    const user = socket.handshake.auth.user;

    console.log("User connected:", user?.username);

    //! JOIN ROOM HANDLER
    socket.on("join room", (groupId) => {
      // Allow all users (premium and non-premium) to join the room for text messages
      socket.join(groupId);

      connectedUsers.set(socket.id, { user, room: groupId });

      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      io.in(groupId).emit("users in room", usersInRoom);

      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined.`,
        user,
      });
    });

    //! LEAVE ROOM HANDLER
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} is leaving room:`, groupId);

      socket.leave(groupId);

      connectedUsers.delete(socket.id);

      socket.to(groupId).emit("user left", user?._id);
    });

    //! WEBRTC SIGNAL HANDLER
    socket.on("webrtc signal", ({ signal, to }) => {
      // Restrict WebRTC signaling (audio/video calling) to premium users only
      if (!user?.isPremium) {
        socket.emit("notification", {
          type: "ERROR",
          message: "Audio/video calls are restricted to premium users.",
        });
        return;
      }

      io.to(to).emit("webrtc signal", { signal, from: socket.id });
    });

    //! NEW MESSAGE HANDLER
    socket.on("new message", (message) => {
      // Allow all users to send messages
      socket.to(message.groupId).emit("message received", message);
    });

    //! TYPING INDICATOR HANDLER
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });

    //! DISCONNECT HANDLER
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected.`);

      if (connectedUsers.has(socket.id)) {
        const { room } = connectedUsers.get(socket.id);

        socket.to(room).emit("user left", user?._id);

        connectedUsers.delete(socket.id);
      }
    });
  });
};

module.exports = socketIo;
