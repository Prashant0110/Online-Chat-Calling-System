let users = {}; // Store user connections by groupId

const socketServer = (io) => {
  io.on("connection", (socket) => {
    // Extract user details from handshake.auth
    const user = socket.handshake.auth.user;
    if (!user) {
      console.log("User authentication failed");
      socket.disconnect();
      return;
    }

    console.log("User connected:", user.username);

    // When a user joins a group
    socket.on("joinGroup", (groupId) => {
      if (!users[groupId]) {
        users[groupId] = [];
      }
      users[groupId].push({ socketId: socket.id, user });
      socket.join(groupId); // Add user to the group room
      console.log(`User ${user.username} joined group ${groupId}`);

      // Emit updated user list to the group
      io.to(groupId).emit(
        "usersInRoom",
        users[groupId].map((u) => u.user)
      );
    });

    // Handle sending a message to a group
    socket.on("sendMessage", (message) => {
      const { groupId } = message;
      io.to(groupId).emit("message", message); // Broadcast message to all clients in the group
    });

    // Handle typing event
    socket.on("typing", ({ groupId, username }) => {
      socket.to(groupId).emit("typing", { username });
    });

    // Handle stop-typing event
    socket.on("stop-typing", (groupId) => {
      socket.to(groupId).emit("stop-typing");
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log(`User ${user.username} disconnected:`, socket.id);
      for (let groupId in users) {
        users[groupId] = users[groupId].filter((u) => u.socketId !== socket.id);
        if (users[groupId].length === 0) delete users[groupId]; // Clean up empty groups
      }
    });
  });
};

module.exports = socketServer;
