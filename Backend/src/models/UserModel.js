const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    hasPaidForCalling: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
