require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("CORS policy error: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong on the server",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
