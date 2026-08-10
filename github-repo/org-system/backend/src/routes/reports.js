const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// GET /api/reports - filtered by role
// Enumerator: only own reports. Supervisor+: reports from their department/team.
router.get("/", async (req, res) => {
  const { status } = req.query;
  const where = {};
  if (status) where.status = status;

  if (req.user.role === "ENUMERATOR") {
    where.submittedBy = req.user.id;
  } else if (req.user.departmentId && req.user.role !== "SUPER_ADMIN") {
    where.team = { departmentId: req.user.departmentId };
  }

  const reports = await prisma.report.findMany({
    where,
    include: {
      submitter: { select: { fullName: true, role: true } },
      reviewer: { select: { fullName: true } },
      team: { select: { name: true, departmentId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(reports);
});

// POST /api/reports - enumerator submits a report
router.post("/", async (req, res) => {
  const { title, description, teamId, latitude, longitude, attachments } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const report = await prisma.report.create({
    data: {
      title,
      description,
      teamId: teamId ? Number(teamId) : null,
      submittedBy: req.user.id,
      latitude, longitude,
      attachments,
    },
  });
  res.status(201).json(report);
});

// PATCH /api/reports/:id/review - supervisor/manager approves or rejects
router.patch("/:id/review", authorize("SUPERVISOR", "FIELD_MANAGER", "MANAGER", "SUPER_ADMIN"), async (req, res) => {
  const { status, reviewNote } = req.body; // status: APPROVED | REJECTED
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "status must be APPROVED or REJECTED" });
  }
  const report = await prisma.report.update({
    where: { id: Number(req.params.id) },
    data: { status, reviewNote, reviewedBy: req.user.id, reviewedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: report.submittedBy,
      type: "APPROVAL",
      message: `Your report "${report.title}" was ${status.toLowerCase()}.`,
    },
  });

  res.json(report);
});

module.exports = router;
