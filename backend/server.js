require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    // Only load routes after the database connection is established
    const userRoutes = require("./routes/user");
    const conversationRoutes = require("./routes/conversation");
    const messageRoutes = require("./routes/message");

    app.use("/user", userRoutes);
    app.use("/conversations", conversationRoutes);
    app.use("/messages", messageRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
