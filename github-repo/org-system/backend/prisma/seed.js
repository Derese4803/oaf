require("dotenv").config(); // <-- ADD THIS AT THE VERY TOP
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const departments = await Promise.all(
    ["M&E", "Tree Team", "Innovation", "Procurement", "HR"].map((name) =>
      prisma.department.upsert({ where: { name }, update: {}, create: { name } })
    )
  );
  const meDept = departments.find((d) => d.name === "M&E");

  const pass = await bcrypt.hash("password123", 10);

  const superAdmin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      employeeId: "EMP-0001",
      fullName: "System Administrator",
      username: "admin",
      passwordHash: pass,
      role: "SUPER_ADMIN",
      position: "Super Admin",
      status: "ACTIVE",
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: "manager1" },
    update: {},
    create: {
      employeeId: "EMP-0002",
      fullName: "Selam Tesfaye",
      username: "manager1",
      passwordHash: pass,
      role: "MANAGER",
      position: "Department Manager",
      departmentId: meDept.id,
      status: "ACTIVE",
    },
  });

  const fieldManager = await prisma.user.upsert({
    where: { username: "fieldmgr1" },
    update: {},
    create: {
      employeeId: "EMP-0003",
      fullName: "Dawit Bekele",
      username: "fieldmgr1",
      passwordHash: pass,
      role: "FIELD_MANAGER",
      position: "Field Manager",
      departmentId: meDept.id,
      supervisorId: manager.id,
      status: "ACTIVE",
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { username: "supervisor1" },
    update: {},
    create: {
      employeeId: "EMP-0004",
      fullName: "Marta Alemu",
      username: "supervisor1",
      passwordHash: pass,
      role: "SUPERVISOR",
      position: "Field Supervisor",
      departmentId: meDept.id,
      supervisorId: fieldManager.id,
      status: "ACTIVE",
    },
  });

  const enumerator = await prisma.user.upsert({
    where: { username: "abebe.k" },
    update: {},
    create: {
      employeeId: "EMP-0005",
      fullName: "Abebe Kebede",
      username: "abebe.k",
      passwordHash: pass,
      role: "ENUMERATOR",
      position: "Enumerator",
      departmentId: meDept.id,
      supervisorId: supervisor.id,
      status: "ACTIVE",
    },
  });

  const team = await prisma.team.create({
    data: {
      name: "M&E Field Team A",
      departmentId: meDept.id,
      members: {
        create: [{ userId: supervisor.id }, { userId: enumerator.id }],
      },
    },
  });

  await prisma.report.create({
    data: {
      title: "Weekly field visit - Woreda 3",
      description: "Collected household survey data from 24 farmers.",
      teamId: team.id,
      submittedBy: enumerator.id,
      status: "SUBMITTED",
    },
  });

  console.log("Seed complete.");
  console.log("Login accounts (all use password: password123):");
  console.log("  admin        - SUPER_ADMIN");
  console.log("  manager1     - MANAGER");
  console.log("  fieldmgr1    - FIELD_MANAGER");
  console.log("  supervisor1  - SUPERVISOR");
  console.log("  abebe.k      - ENUMERATOR");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });