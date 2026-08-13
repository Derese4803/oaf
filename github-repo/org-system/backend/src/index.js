require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Route Handlers
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const departmentRoutes = require("./routes/departments");
const teamRoutes = require("./routes/teams");
const reportRoutes = require("./routes/reports");
const attendanceRoutes = require("./routes/attendance");
const letterRoutes = require("./routes/letters");
const notificationRoutes = require("./routes/notifications");
const statsRoutes = require("./routes/stats");

const app = express();

// Middleware Configurations
app.use(cors({
  origin: "*", // Adjust to specific domain (e.g. process.env.FRONTEND_URL) in production if needed
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

// Catch-All 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong on the server",
  });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});