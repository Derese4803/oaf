const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// GET /api/attendance/today - today's log for the current user
router.get("/today", async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const logs = await prisma.attendanceLog.findMany({
    where: { userId: req.user.id, timestamp: { gte: startOfDay } },
    orderBy: { timestamp: "asc" },
  });
  res.json(logs);
});

// GET /api/attendance/history?userId=&from=&to=
router.get("/history", async (req, res) => {
  const userId = req.query.userId ? Number(req.query.userId) : req.user.id;
  const where = { userId };
  if (req.query.from || req.query.to) {
    where.timestamp = {};
    if (req.query.from) where.timestamp.gte = new Date(req.query.from);
    if (req.query.to) where.timestamp.lte = new Date(req.query.to);
  }
  const logs = await prisma.attendanceLog.findMany({ where, orderBy: { timestamp: "desc" } });
  res.json(logs);
});

// POST /api/attendance/event  { event: "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END" }
router.post("/event", async (req, res) => {
  const { event } = req.body;
  const valid = ["CLOCK_IN", "CLOCK_OUT", "BREAK_START", "BREAK_END"];
  if (!valid.includes(event)) return res.status(400).json({ error: "Invalid event type" });

  const log = await prisma.attendanceLog.create({ data: { userId: req.user.id, event } });
  res.status(201).json(log);
});

module.exports = router;
