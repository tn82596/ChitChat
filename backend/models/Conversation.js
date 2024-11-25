const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Reference to the last message
  updatedAt: { type: Date, default: Date.now }, // Last activity timestamp
});

module.exports = mongoose.model("Conversation", conversationSchema);