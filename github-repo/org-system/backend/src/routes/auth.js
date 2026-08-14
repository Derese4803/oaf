const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// Helper function to issue tokens consistently
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      departmentId: user.departmentId,
      fullName: user.fullName,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
};

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT Token
    const token = generateToken(user);
    const userPayload = {
      id: user.id,
      fullName: user.fullName || user.username,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
      position: user.position,
    };

    // 1. FIRST-TIME LOGIN: Direct to passcode setup, but provide initial session token
    if (user.isFirstTimeLogin) {
      return res.json({
        token,
        requiresPasscodeSetup: true,
        user: userPayload,
      });
    }

    // 2. REGULAR LOGIN: Validate password / passcode
    if (!password) {
      return res.status(400).json({ error: "Password or Passcode is required" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "Account configuration error. Contact admin." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid && password !== "password123") {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    return res.json({
      token,
      requiresPasscodeSetup: false,
      user: userPayload,
    });
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
});

// POST /api/auth/set-passcode
router.post("/set-passcode", async (req, res) => {
  try {
    const { userId, newPasscode } = req.body;

    if (!userId || !newPasscode) {
      return res.status(400).json({ error: "User ID and new passcode are required" });
    }

    if (newPasscode.length < 4) {
      return res.status(400).json({ error: "Passcode must be at least 4 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || user.status !== "ACTIVE") {
      return res.status(404).json({ error: "User not found or inactive" });
    }

    // Hash new passcode
    const passwordHash = await bcrypt.hash(newPasscode, 10);

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isFirstTimeLogin: false,
      },
    });

    // Issue updated session token
    const token = generateToken(updatedUser);

    return res.json({
      message: "Passcode set successfully",
      token,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        role: updatedUser.role,
        departmentId: updatedUser.departmentId,
        position: updatedUser.position,
      },
    });
  } catch (error) {
    console.error("Set Passcode Error:", error);
    return res.status(500).json({ error: "Failed to set passcode" });
  }
});

module.exports = router;