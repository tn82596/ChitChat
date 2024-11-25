const express = require("express");
const Message = require("../models/Message.js");
const Conversation = require("../models/Conversation.js");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

//add a new message to a conversation 
// and update the conversation's last message & activity
router.post("/", verifyToken, async (req, res) => {
  const { conversationId, content } = req.body;

  try {
    const newMessage = new Message({
      conversationId,
      sender: req.user.id,
      content,
    });

    await newMessage.save();

    // Update the conversation's lastMessage and updatedAt fields
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: Date.now(),
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
});


//retrieve all messages in a conversation, sorted by timestamp
router.get("/:conversationId", verifyToken, async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query; // Optional pagination parameters
  
    try {
      const messages = await Message.find({ conversationId })
        .sort({ timestamp: -1 }) // Fetch the newest messages first
        .skip((page - 1) * limit) // Skip messages for previous pages
        .limit(parseInt(limit)); // Limit the number of messages returned
  
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ message: "Error fetching messages", error: err.message });
    }
  });

module.exports = router;