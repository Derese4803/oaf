const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

// GET /api/users - list users (scoped by department for non-super-admins)
router.get("/", async (req, res) => {
  const where = {};
  if (req.user.role !== "SUPER_ADMIN" && req.user.departmentId) {
    where.departmentId = req.user.departmentId;
  }
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, employeeId: true, fullName: true, username: true, role: true,
      position: true, phone: true, email: true, status: true, departmentId: true,
      supervisorId: true, createdAt: true,
      department: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

// POST /api/users - HR/Super Admin creates a user account
router.post("/", authorize("SUPER_ADMIN", "DEPT_ADMIN"), async (req, res) => {
  const { employeeId, fullName, username, password, role, position, phone, email, departmentId, supervisorId } = req.body;

  if (!employeeId || !fullName || !username || !password || !role) {
    return res.status(400).json({ error: "employeeId, fullName, username, password, and role are required" });
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { employeeId }] } });
  if (existing) {
    return res.status(409).json({ error: "A user with this username or employee ID already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      employeeId, fullName, username, passwordHash, role,
      position, phone, email,
      departmentId: departmentId ? Number(departmentId) : null,
      supervisorId: supervisorId ? Number(supervisorId) : null,
    },
  });

  res.status(201).json({ id: user.id, username: user.username, fullName: user.fullName });
});

// PATCH /api/users/:id - update status, role, supervisor, etc.
router.patch("/:id", authorize("SUPER_ADMIN", "DEPT_ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { fullName, role, position, phone, email, status, departmentId, supervisorId } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(role !== undefined && { role }),
      ...(position !== undefined && { position }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(status !== undefined && { status }),
      ...(departmentId !== undefined && { departmentId: departmentId ? Number(departmentId) : null }),
      ...(supervisorId !== undefined && { supervisorId: supervisorId ? Number(supervisorId) : null }),
    },
  });

  res.json({ id: user.id, status: "updated" });
});

// POST /api/users/:id/reset-password - HR/admin resets a password
router.post("/:id/reset-password", authorize("SUPER_ADMIN", "DEPT_ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  res.json({ status: "password reset" });
});

module.exports = router;
