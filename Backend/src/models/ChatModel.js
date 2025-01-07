//schema
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;
