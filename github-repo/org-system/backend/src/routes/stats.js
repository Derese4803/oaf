const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

router.get("/dashboard", async (req, res) => {
  const deptFilter =
    req.user.role !== "SUPER_ADMIN" && req.user.departmentId
      ? { departmentId: req.user.departmentId }
      : {};

  const [totalStaff, activeStaff, totalTeams, pendingReports, approvedReports, rejectedReports, departments] =
    await Promise.all([
      prisma.user.count({ where: deptFilter }),
      prisma.user.count({ where: { ...deptFilter, status: "ACTIVE" } }),
      prisma.team.count({ where: deptFilter }),
      prisma.report.count({ where: { status: "SUBMITTED" } }),
      prisma.report.count({ where: { status: "APPROVED" } }),
      prisma.report.count({ where: { status: "REJECTED" } }),
      prisma.department.findMany({
        select: {
          id: true,
          name: true,
          teams: { select: { reports: { select: { status: true } } } },
        },
      }),
    ]);

  const departmentPerformance = departments.map((d) => {
    const allReports = d.teams.flatMap((t) => t.reports);
    const total = allReports.length;
    const approved = allReports.filter((r) => r.status === "APPROVED").length;
    const pending = allReports.filter((r) => r.status === "SUBMITTED").length;
    const performance = total > 0 ? Math.round((approved / total) * 1000) / 10 : 0;
    return { department: d.name, totalReports: total, approved, pending, performancePct: performance };
  });

  res.json({
    totalStaff,
    activeStaff,
    totalTeams,
    pendingReports,
    approvedReports,
    rejectedReports,
    departmentPerformance,
  });
});

module.exports = router;
