const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { ExpressPeerServer } = require("peer");
const socketServer = require("./socketServer");

dotenv.config({ path: "../.env" });
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Peer server setup
const peerServer = ExpressPeerServer(server, {
  path: "/peerjs",
});

app.use("/peerjs", peerServer);

// Middleware
app.use(cors());
app.use(express.json());
socketServer(io);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/users", paymentRoutes);

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Database connection error:", err);
  });

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
