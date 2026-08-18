const express = require("express");
const cors = require("cors");

const authRoutes = require("../src/routes/auth");
const userRoutes = require("../src/routes/users");
const departmentRoutes = require("../src/routes/departments");
const teamRoutes = require("../src/routes/teams");
const reportRoutes = require("../src/routes/reports");
const attendanceRoutes = require("../src/routes/attendance");
const letterRoutes = require("../src/routes/letters");
const notificationRoutes = require("../src/routes/notifications");
const statsRoutes = require("../src/routes/stats");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

module.exports = app;
