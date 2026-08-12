const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.status !== "ACTIVE") {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // 1. FIRST-TIME LOGIN: Direct to passcode setup
  if (user.isFirstTimeLogin) {
    return res.json({
      requiresPasscodeSetup: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
      },
    });
  }

  // 2. REGULAR LOGIN: Require password for configured accounts
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ error: "Account configuration error. Contact admin." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      departmentId: user.departmentId,
      fullName: user.fullName,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId,
      position: user.position,
    },
  });
});

// POST /api/auth/set-passcode
router.post("/set-passcode", async (req, res) => {
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

  // Issue session token
  const token = jwt.sign(
    {
      id: updatedUser.id,
      role: updatedUser.role,
      departmentId: updatedUser.departmentId,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

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
});

module.exports = router;