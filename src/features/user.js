import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { issueToken } from "../utils/jwt.js";

const router = express.Router();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" }
});

const User = mongoose.model("User", userSchema);

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.json({ message: "User registered", id: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = issueToken(user);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export { router as userRouter, User };
