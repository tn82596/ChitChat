const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

//sigup
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        // hash the password for cool security :D 
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User successfully signed up"});
    }
    catch (err) {
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
});

//login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Incorrect password" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

//recover profile
router.get("/profile/:userID", verifyToken, async (req, res) => {
    const { userID } = req.params;

    try {
        const user = await User.findById(userID).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
});

//get name from ID
router.get("/name/:userID", verifyToken, async (req, res) => {
    const { userID } = req.params;

    try {
        const user = await User.findById(userID).select("name");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ name: user.name });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
});

//get ID from email
router.get("/id/:email", verifyToken, async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email }).select("_id");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ id: user._id });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ message: "Error fetching user", error: err.message });
    }
});

module.exports = router;