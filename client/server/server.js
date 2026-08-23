require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL PASS EXISTS:",
  !!process.env.EMAIL_PASS
);

const db = require("./config/db");

// ========================================
// APP
// ========================================

const app = express();

const PORT =
  process.env.PORT || 5000;


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

const {
  protect
} = require("./middleware/authMiddleware");


// ========================================
// GLOBAL MIDDLEWARE
// ========================================

app.use(cors());

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);


// ========================================
// STATIC UPLOADS
// ========================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


// ========================================
// API ROUTES
// ========================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/events",
  eventRoutes
);

app.use(
  "/api/registrations",
  registrationRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);


// ========================================
// TEST SINGLE EVENT ROUTE
// ========================================

app.get(
  "/test-event/:id",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(
          "SELECT * FROM events WHERE id = ?",
          [req.params.id]
        );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "Event not found"
        });
      }

      res.json(
        rows[0]
      );

    } catch (error) {

      console.error(
        "TEST EVENT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Database error",
        error:
          error.message
      });
    }
  }
);


// ========================================
// AUTH TEST
// GET /api/auth/me
// ========================================

app.get(
  "/api/auth/me",
  protect,
  (req, res) => {

    res.json({
      success: true,
      message:
        "You are authenticated!",
      user:
        req.user
    });

  }
);


// ========================================
// START SERVER
// ========================================

app.listen(
  PORT,
  () => {

    console.log(
      `🚀 Server running on http://localhost:${PORT}`
    );

  }
);