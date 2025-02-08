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
const { handleStripeWebhook } = require("./controller/stripeController");

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(cors(corsOptions));
app.use(express.json());

const io = socketIo(server, { cors: corsOptions });
socketServer(io);

const peerServer = ExpressPeerServer(server, { path: "/peerjs" });
app.use("/peerjs", peerServer);

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/payments", paymentRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
