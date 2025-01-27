const socketServer = (io) => {
  // Store connected users with their room information using socket.id as their key
  const connectedUsers = new Map();

  // Handle new socket connections
  io.on("connection", (socket) => {
    // Get user from authentication
    const user = socket.handshake.auth.user;
    console.log("User connected:", user?.username);

    //! START: Join Room Handler
    socket.on("join room", (groupId) => {
      // Add socket to the specified room
      socket.join(groupId);

      // Store user and room info in connectedUsers map
      connectedUsers.set(socket.id, { user, room: groupId });

      // Get list of all users currently in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);

      // Emit updated users list to all clients in the room
      io.in(groupId).emit("users in room", usersInRoom);

      // Broadcast join notification to all other users in the room
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user,
      });
    });
    //! END: Join Room Handler

    //! START: Leave Room Handler
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving room:`, groupId);

      // Remove socket from the room
      socket.leave(groupId);

      if (connectedUsers.has(socket.id)) {
        // Remove user from connected users and notify others
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });
    //! END: Leave Room Handler

    //! START: New Message Handler
    socket.on("new message", (message) => {
      // Broadcast message to all other users in the room
      socket.to(message.groupId).emit("message received", message);
    });
    //! END: New Message Handler

    //! START: Typing Indicator
    socket.on("typing", ({ groupId, username }) => {
      // Broadcast typing status to other users in the room
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      // Broadcast stop typing status to other users in the room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });
    //! END: Typing Indicator

    //! START: Call Signaling
    socket.on("callUser", ({ userToCall, signalData, callerId }) => {
      io.to(userToCall).emit("callUser", {
        signal: signalData,
        from: callerId,
      });
      console.log(`Call initiated from ${callerId} to ${userToCall}`);
    });

    socket.on("answerCall", ({ to, signal }) => {
      io.to(to).emit("callAccepted", signal);
      console.log(`Call answered by ${socket.id} to ${to}`);
    });
    //! END: Call Signaling

    //! START: Disconnect Handler
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);

      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);

        // Notify others in the room about user's departure
        socket.to(userData.room).emit("user left", user?._id);

        // Remove user from connected users
        connectedUsers.delete(socket.id);
      }
    });
    //! END: Disconnect Handler

    //! START: Error Handler
    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });
    //! END: Error Handler
  });
};

module.exports = socketServer;
