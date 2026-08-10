const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
});

router.patch("/:id/read", async (req, res) => {
  await prisma.notification.update({
    where: { id: Number(req.params.id) },
    data: { read: true },
  });
  res.json({ status: "read" });
});

// Called periodically by the frontend (or a cron) to generate schedule-based
// alerts: coffee break, lunch, late arrival, end-of-day, Happy Friday.
// Times are read from env-configurable defaults; in a real deployment these
// would come from an admin-configurable settings table.
router.post("/check-schedule", async (req, res) => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 5 = Friday
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const hm = hours * 60 + minutes;

  const rules = [
    { type: "COFFEE_TIME", start: 10 * 60 + 30, end: 10 * 60 + 45, message: "It's coffee break time. ☕" },
    { type: "LUNCH_TIME", start: 12 * 60 + 30, end: 13 * 60 + 30, message: "It's lunch time. 🍽️" },
    { type: "COFFEE_TIME", start: 15 * 60 + 30, end: 15 * 60 + 45, message: "Afternoon coffee break. ☕" },
    { type: "END_OF_DAY", start: 17 * 60 + 15, end: 17 * 60 + 30, message: "Your working day is almost complete." },
  ];

  const created = [];
  for (const rule of rules) {
    if (hm >= rule.start && hm <= rule.end) {
      const n = await prisma.notification.create({
        data: { userId: req.user.id, type: rule.type, message: rule.message },
      });
      created.push(n);
    }
  }

  if (day === 5) {
    const n = await prisma.notification.create({
      data: { userId: req.user.id, type: "HAPPY_FRIDAY", message: "🎉 Happy Friday! Have a great weekend." },
    });
    created.push(n);
  }

  res.json(created);
});

module.exports = router;
