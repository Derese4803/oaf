const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { users: true, teams: true } } },
    orderBy: { name: "asc" },
  });
  res.json(departments);
});

router.post("/", authorize("SUPER_ADMIN"), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Department name is required" });
  const dept = await prisma.department.create({ data: { name } });
  res.status(201).json(dept);
});

router.delete("/:id", authorize("SUPER_ADMIN"), async (req, res) => {
  await prisma.department.delete({ where: { id: Number(req.params.id) } });
  res.json({ status: "deleted" });
});

module.exports = router;
