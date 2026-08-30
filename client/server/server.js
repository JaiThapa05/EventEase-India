require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./config/db");

// ========================================
// APP
// ========================================

const app = express();

const PORT = process.env.PORT || 5000;

// ========================================
// ROUTES
// ========================================

const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes");

// ========================================
// AUTH MIDDLEWARE
// ========================================

const { protect } = require("./middleware/authMiddleware");

// ========================================
// GLOBAL MIDDLEWARE
// ========================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventEase India API is running 🚀",
    server: "Render",
    database: process.env.DB_NAME || "NOT CONFIGURED",
  });
});

// ========================================
// API TEST
// ========================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EventEase API is working 🚀",
  });
});


// ========================================
// STATIC UPLOADS
// ========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/registrations", registrationRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/contact", contactRoutes);




// ========================================
// TEST SINGLE EVENT
// ========================================

app.get("/test-event/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event: rows[0],
    });
  } catch (error) {
    console.error("TEST EVENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
});

// ========================================
// AUTH TEST
// ========================================

app.get("/api/auth/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated!",
    user: req.user,
  });
});

// ========================================
// 404 API HANDLER
// ========================================

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(`🚀 EventEase API running on port ${PORT}`);
});