require("dotenv").config(); // Load environment variables

const express = require("express");
const userRoutes = require("./src/routes/userRoutes");

const app = express();
app.use(express.json());

// Use your routes
app.use("/api/users", userRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
