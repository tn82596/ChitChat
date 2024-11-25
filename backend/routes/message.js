const Message = require("../models/Message");

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