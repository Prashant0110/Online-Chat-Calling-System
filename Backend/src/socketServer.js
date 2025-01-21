const socketServer = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle signaling for calls
    socket.on("callUser", ({ userToCall, signalData }) => {
      io.to(userToCall).emit("callUser", {
        signal: signalData,
        from: socket.id,
      });
    });

    socket.on("answerCall", ({ to, signal }) => {
      io.to(to).emit("callAccepted", signal);
    });

    // Other socket event handlers...
  });
};

module.exports = socketServer;
