require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require("./routes/user");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");

const app = express();
const PORT = process.env.PORT || 5001;

// Create server and initialize socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust if your frontend uses a different port
    methods: ["GET", "POST"]
  }
});

// allow frontend origin
app.use(cors({origin: 'http://localhost:3000' }));

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.use("/user", userRoutes);
app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);

// Socket.IO: Handle real-time messaging
io.on("connection", (socket) => {
  console.log("New client connected");

  // Listen for new messages and broadcast them to other users in the conversation
  socket.on("sendMessage", (message) => {
    // Broadcast the message to all users in the same conversation
    socket.to(message.conversationId).emit("receiveMessage", message);
  });

  // Join a specific conversation to listen for updates
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});