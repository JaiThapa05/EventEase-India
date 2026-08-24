const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");


// ========================================
// ADD REVIEW
// POST /api/reviews
// ========================================

router.post("/", protect, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { event_id, rating, comment } = req.body;

    if (!event_id || !rating) {
      return res.status(400).json({
        message: "Event and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    // Check event
    const [events] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    // Check participant registered
    const [registration] = await db.query(
      `SELECT *
       FROM registrations
       WHERE event_id = ?
       AND user_id = ?
       AND status = 'registered'`,
      [event_id, user_id]
    );

    if (registration.length === 0) {
      return res.status(403).json({
        message: "You must register for this event before reviewing it"
      });
    }

    // Check existing review
    const [existing] = await db.query(
      `SELECT *
       FROM reviews
       WHERE event_id = ?
       AND user_id = ?`,
      [event_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "You have already reviewed this event"
      });
    }

    // Insert review
    await db.query(
      `INSERT INTO reviews
       (event_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [
        event_id,
        user_id,
        rating,
        comment || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully"
    });

  } catch (error) {

    console.error("ADD REVIEW ERROR:", error);

    res.status(500).json({
      message: "Failed to submit review",
      error: error.message
    });
  }
});


// ========================================
// GET EVENT REVIEWS
// GET /api/reviews/event/:eventId
// ========================================

router.get("/event/:eventId", async (req, res) => {
  try {

    const { eventId } = req.params;

    const [reviews] = await db.query(
      `SELECT
        reviews.id,
        reviews.rating,
        reviews.comment,
        reviews.created_at,
        users.name,
        users.profile_photo
       FROM reviews
       INNER JOIN users
         ON reviews.user_id = users.id
       WHERE reviews.event_id = ?
       ORDER BY reviews.created_at DESC`,
      [eventId]
    );

    res.json(reviews);

  } catch (error) {

    console.error("GET REVIEWS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
});

router.get("/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log("🔍 REVIEWS REQUEST");
    console.log("EVENT ID:", eventId);

    const [reviews] = await db.query(
      `SELECT
        reviews.id,
        reviews.event_id,
        reviews.rating,
        reviews.comment,
        reviews.created_at,
        users.name,
        users.profile_photo
       FROM reviews
       INNER JOIN users
         ON reviews.user_id = users.id
       WHERE reviews.event_id = ?
       ORDER BY reviews.created_at DESC`,
      [eventId]
    );

    console.log("⭐ REVIEWS FOUND:", reviews);

    res.json(reviews);

  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
});


module.exports = router;