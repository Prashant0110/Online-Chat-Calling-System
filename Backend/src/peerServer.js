const { ExpressPeerServer } = require("peer");
const express = require("express");
const app = express();

const server = app.listen(9000);
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log("Client connected:", client.id);
});

peerServer.on("disconnect", (client) => {
  console.log("Client disconnected:", client.id);
});
