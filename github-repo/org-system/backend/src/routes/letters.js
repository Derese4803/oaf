const express = require("express");
const prisma = require("../lib/prisma");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
router.use(authenticate);

function generateReferenceNo() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LTR-${year}-${rand}`;
}

router.get("/", async (req, res) => {
  const where = {};
  if (req.user.role !== "SUPER_ADMIN" && req.user.departmentId) {
    where.departmentId = req.user.departmentId;
  }
  if (req.query.direction) where.direction = req.query.direction;
  if (req.query.status) where.status = req.query.status;

  const letters = await prisma.letter.findMany({
    where,
    include: { creator: { select: { fullName: true } }, department: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(letters);
});

router.post("/", async (req, res) => {
  const { subject, body, direction, departmentId, ccList } = req.body;
  if (!subject || !direction) return res.status(400).json({ error: "subject and direction are required" });

  const letter = await prisma.letter.create({
    data: {
      referenceNo: generateReferenceNo(),
      subject, body, direction,
      departmentId: departmentId ? Number(departmentId) : null,
      createdBy: req.user.id,
      ccList,
    },
  });
  res.status(201).json(letter);
});

// PATCH /api/letters/:id/status - move through Review -> Approve -> Sign -> Send -> Archive
router.patch("/:id/status", authorize("SUPERVISOR", "FIELD_MANAGER", "MANAGER", "SUPER_ADMIN", "DEPT_ADMIN"), async (req, res) => {
  const { status } = req.body;
  const valid = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "SIGNED", "SENT", "ARCHIVED"];
  if (!valid.includes(status)) return res.status(400).json({ error: "Invalid status" });

  const letter = await prisma.letter.update({
    where: { id: Number(req.params.id) },
    data: { status },
  });
  res.json(letter);
});

module.exports = router;
