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

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Socket.io setup
const io = socketIo(server, {
  cors: corsOptions,
});
socketServer(io);

// Peer server setup
const peerServer = ExpressPeerServer(server, {
  path: "/peerjs",
});
app.use("/peerjs", peerServer);

// ✅ Apply express.raw() **ONLY for Stripe Webhook**
app.use("/api/payments", express.raw({ type: "application/json" }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/payments", paymentRoutes); // ✅ Fixed

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
