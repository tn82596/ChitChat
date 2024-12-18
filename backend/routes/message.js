const express = require("express");
const Message = require("../models/Message.js");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation.js");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

//add a new message to a conversation 
// and update the conversation's last message & activity
router.post("/", verifyToken, async (req, res) => {
  const { conversationId, content, recipientId } = req.body;

  try {
    const newMessage = new Message({
      conversationId,
      sender: req.user.id,
      content,
      recipient: recipientId,
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

// Search for messages by keyword in a specific conversation
router.get("/search/:conversationId", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query; // Get the query string from the URL

    // Validate the query parameter
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Find messages in the conversation that match the query
    const messages = await Message.find({
      conversationId: conversationId,  // Ensure the message belongs to the conversation
      content: { $regex: query, $options: "i" }, // Case-insensitive search
    })
      .sort({ timestamp: -1 }) // Sort by timestamp, most recent first
      .exec();

    // If no messages were found
    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found matching the search." });
    }

    // Return the matching messages
    return res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while searching for messages." });
  }
});

// Delete a message by ID
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the message to delete
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Delete the message
    await Message.findByIdAndDelete(id);

    // Find the conversation the message belongs to
    const conversationId = message.conversationId;

    // Get the most recent message in the conversation after deletion
    const mostRecentMessage = await Message.findOne({ conversationId })
      .sort({ timestamp: -1 }) 
      .exec();

    // Update the conversation's lastMessage and updatedAt fields
    if (mostRecentMessage) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: mostRecentMessage._id,
        updatedAt: mostRecentMessage.timestamp,
      });
    } else {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: null,
        updatedAt: null,
      });
    }

    res.status(200).json({ message: "Message deleted and conversation updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting the message." });
  }
});

// find the messages surrounding a specific message to be displayed on a search
router.get('/findSurrounding/:messageID', verifyToken, async (req, res) => {
  const { messageID } = req.params;

  try {
    const message = await Message.findById(messageID);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const timestamp = message.timestamp; 
    const conversationId = message.conversationId;

    // get messages before
    const beforeMessages = await Message.find({
      conversationId: conversationId,
      timestamp: { $lt: timestamp }, 
    })
      .sort({ timestamp: -1 }) 
      .limit(10);
    
    // get messages after
    const afterMessages = await Message.find({
      conversationId: conversationId, 
      timestamp: { $gt: timestamp },
    })
      .sort({ timestamp: 1 }) 
      .limit(10);

    const surroundingMessages = [...beforeMessages.reverse(), message, ...afterMessages];

    res.status(200).json(surroundingMessages);
  } catch (error) {
    console.error('Error fetching surrounding messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit a message
router.put("/edit/:messageId", verifyToken, async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content }, 
      { new: true } 
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// react to or remove a reaction from a message
router.put("/react/:messageId", verifyToken, async (req, res) => {
  const { messageId } = req.params;
  const { reaction } = req.body;  // "like", "love", or "dislike"

  if (!["like", "love", "dislike"].includes(reaction)) {
    return res.status(400).json({ error: "Invalid reaction" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const userId = req.user.id; // Assuming `req.user.id` is the authenticated user's ID

    // Remove the reaction if the user has already reacted with it
    if (message.reactions[reaction].includes(userId)) {
      message.reactions[reaction] = message.reactions[reaction].filter(id => id.toString() !== userId.toString());
    } else {
      // Remove any existing reaction of the same user on the message
      for (let reactType of ["like", "love", "dislike"]) {
        message.reactions[reactType] = message.reactions[reactType].filter(id => id.toString() !== userId.toString());
      }
      // Add the new reaction
      message.reactions[reaction].push(userId);
    }

    await message.save();
    res.status(200).json(message); 
  } catch (error) {
    console.error("Error updating reactions:", error);
    res.status(500).json({ error: "Failed to update reactions" });
  }
});


module.exports = router;