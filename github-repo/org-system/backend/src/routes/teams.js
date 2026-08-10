const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/", async (req, res) => {
  const where = {};
  if (req.user.role !== "SUPER_ADMIN" && req.user.departmentId) {
    where.departmentId = req.user.departmentId;
  }
  const teams = await prisma.team.findMany({
    where,
    include: {
      department: { select: { name: true } },
      members: { include: { user: { select: { id: true, fullName: true, role: true } } } },
      _count: { select: { reports: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(teams);
});

router.post("/", authorize("SUPER_ADMIN", "MANAGER", "FIELD_MANAGER"), async (req, res) => {
  const { name, departmentId } = req.body;
  if (!name || !departmentId) return res.status(400).json({ error: "name and departmentId are required" });
  const team = await prisma.team.create({ data: { name, departmentId: Number(departmentId) } });
  res.status(201).json(team);
});

router.post("/:id/members", authorize("SUPER_ADMIN", "MANAGER", "FIELD_MANAGER", "SUPERVISOR"), async (req, res) => {
  const teamId = Number(req.params.id);
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId is required" });
  const member = await prisma.teamMember.create({ data: { teamId, userId: Number(userId) } });
  res.status(201).json(member);
});

router.delete("/:teamId/members/:userId", authorize("SUPER_ADMIN", "MANAGER", "FIELD_MANAGER", "SUPERVISOR"), async (req, res) => {
  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: Number(req.params.teamId), userId: Number(req.params.userId) } },
  });
  res.json({ status: "removed" });
});

module.exports = router;
