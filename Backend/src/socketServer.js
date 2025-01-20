const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

let users = {}; // Store user connections by groupId

// Handle new connections
const socketServer = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // When a user joins a group
    socket.on("joinGroup", (groupId) => {
      if (!users[groupId]) {
        users[groupId] = [];
      }
      users[groupId].push(socket.id);
      console.log(`User ${socket.id} joined group ${groupId}`);
    });

    // Handle sending a message to a group
    socket.on("sendMessage", (message) => {
      const { groupId } = message;
      if (users[groupId]) {
        // Emit the message to all clients in the group
        users[groupId].forEach((clientSocketId) => {
          io.to(clientSocketId).emit("message", message);
        });
      }
    });

    // Handle typing event
    socket.on("typing", (groupId) => {
      if (users[groupId]) {
        users[groupId].forEach((clientSocketId) => {
          io.to(clientSocketId).emit("typing");
        });
      }
    });

    // Handle stop-typing event
    socket.on("stop-typing", (groupId) => {
      if (users[groupId]) {
        users[groupId].forEach((clientSocketId) => {
          io.to(clientSocketId).emit("stop-typing");
        });
      }
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Remove the user from all groups
      for (let groupId in users) {
        users[groupId] = users[groupId].filter((id) => id !== socket.id);
      }
    });
  });
};

module.exports = socketServer;
