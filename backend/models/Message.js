const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }], // URLs or file paths for attachments
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  timestamp: { type: Date, default: Date.now },
  reactions: {  
    like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  
    love: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],   
    dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] 
  }
});

module.exports = mongoose.model("Message", messageSchema);