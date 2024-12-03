const express = require("express");
const Conversation = require("../models/Conversation");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

//create a new convo
router.post("/", verifyToken, async (req, res) => {
    const { participants } = req.body;
  
    try {
      // Check if a conversation already exists between these exact participants
      const existingConversation = await Conversation.findOne({
        participants: { $all: participants },
      }).where('participants').size(participants.length);
  
      if (existingConversation) {
        // Confirm exact match of participant IDs (order-independent)
        const participantSet = new Set(participants.map(String));
        const conversationSet = new Set(existingConversation.participants.map(String));
  
        if (
          participantSet.size === conversationSet.size &&
          [...participantSet].every((id) => conversationSet.has(id))
        ) {
          return res.status(200).json(existingConversation);
        }
      }
  
      // If no exact match, create a new conversation
      const newConversation = new Conversation({
        participants,
      });
  
      await newConversation.save();
      res.status(201).json(newConversation);
    } catch (err) {
      res.status(500).json({ message: "Error creating conversation", error: err.message });
    }
  });


// get all convos a user is part of, sorted by most recent activity
router.get("/:userID", verifyToken, async (req, res) => {
    const { userID } = req.params;

    try {
        const conversations = await Conversation.find({ participants: userID })
        .populate("lastMessage", "content sender timestamp") // Populate the last message details
        .sort({ updatedAt: -1 }); // Sort by the most recent activity

        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ message: "Error fetching conversations", error: err.message });
    }
});
  
module.exports = router;