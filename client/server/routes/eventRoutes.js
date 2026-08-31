const express = require("express");
const router = express.Router();

const db = require("../config/db");
const {
  protect,
  organizerOnly
}= require("../middleware/authMiddleware");

console.log("✅ EVENT ROUTES FILE LOADED");

// ========================================
// CREATE EVENT
// POST /api/events
// ========================================
router.post(
  "/",
  protect,
  organizerOnly,
  async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      event_date,
      event_time,
      capacity,
      banner,
      source_url,
      registration_url,
      registration_type
    } = req.body;

    const organizer_id = req.user.id;

    // Required fields
    if (
      !title ||
      !description ||
      !category ||
      !location ||
      !event_date ||
      !event_time ||
      !capacity
    ) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    // Create event
    const [result] = await db.query(
      `INSERT INTO events
      (
        organizer_id,
        title,
        description,
        category,
        location,
        event_date,
        event_time,
        capacity,
        banner,
        source_url,
        registration_url,
        registration_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
      [
        organizer_id,
        title,
        description,
        category,
        location,
        event_date,
        event_time,
        capacity,
        banner || null,
        source_url || null,
        registration_url || null,
        registration_type ==="external"
          ? "external"
          : "internal"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      eventId: result.insertId
    });

  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to create event",
      error: error.message
    });
  }
});


// ========================================
// GET ALL EVENTS
// GET /api/events
// ========================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
    "SELECT * FROM events ORDER BY event_date ASC, event_time ASC"
  );

    res.json(rows);

  } catch (error) {
    console.error("GET EVENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message
    });
  }
});


// ========================================
// GET ORGANIZER'S EVENTS
// GET /api/events/my-events
// ========================================
router.get("/my-events", protect, async (req, res) => {
  try {
    const organizer_id = req.user.id;

    const [rows] = await db.query(
      `SELECT 
        events.*,
        COUNT(
          CASE
            WHEN registrations.status = 'registered'
            THEN registrations.id
          END
        ) AS registered_count
      FROM events
      LEFT JOIN registrations
        ON events.id = registrations.event_id
      WHERE events.organizer_id = ?
      GROUP BY events.id
      ORDER BY events.id DESC`,
      [organizer_id]
    );

    res.json(rows);

  } catch (error) {
    console.error("MY EVENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch your events",
      error: error.message
    });
  }
});


// ========================================
// GET EVENT PARTICIPANTS
// GET /api/events/:id/participants
// ========================================
router.get(
  "/:id/participants",
  protect,
  organizerOnly,
  async (req, res) => {
  try {
    const eventId = req.params.id;
    const organizer_id = req.user.id;

    // Check event belongs to organizer
    const [events] = await db.query(
      `SELECT *
       FROM events
       WHERE id = ? AND organizer_id = ?`,
      [eventId, organizer_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found or you are not the organizer"
      });
    }

    // Get participants
    const [participants] = await db.query(
      `SELECT
        registrations.id AS registration_id,
        registrations.registered_at,
        registrations.status,

        users.id AS user_id,
        users.name,
        users.email,
        users.phone,
        users.profile_photo

       FROM registrations

       INNER JOIN users
         ON registrations.user_id = users.id

       WHERE registrations.event_id = ?
         AND registrations.status = 'registered'

       ORDER BY registrations.registered_at DESC`,
      [eventId]
    );

    res.json({
      event: events[0],
      participants: participants
    });

  } catch (error) {

    console.error("GET PARTICIPANTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch participants",
      error: error.message
    });
  }
});


// ========================================
// GET SINGLE EVENT
// GET /api/events/:id
// ========================================
router.get("/:id", async (req, res) => {

  console.log("🔥 SINGLE EVENT ROUTE HIT");
  console.log("Event ID:", req.params.id);

  try {

    const [rows] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [req.params.id]
    );

    console.log("Database result:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Event not found"
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error("SINGLE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch event",
      error: error.message
    });
  }
});


// ========================================
// UPDATE EVENT
// PUT /api/events/:id
// ========================================
router.put(
  "/:id",
  protect,
  organizerOnly,
  async (req, res) => {
  try {

    const eventId = req.params.id;
    const organizer_id = req.user.id;

    const {
      title,
      description,
      category,
      location,
      event_date,
      event_time,
      capacity,
      banner,
      source_url,
      registration_url,
      registration_type
    } = req.body;

    // Check ownership
    const [events] = await db.query(
      `SELECT *
       FROM events
       WHERE id = ? AND organizer_id = ?`,
      [eventId, organizer_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found or you are not the organizer"
      });
    }

    await db.query(
      `UPDATE events
       SET title = ?,
           description = ?,
           category = ?,
           location = ?,
           event_date = ?,
           event_time = ?,
           capacity = ?,
           banner = ?,
           source_url = ?,
           registration_url = ?,
           registration_type = ?
       WHERE id = ? AND organizer_id = ?`,
      [
        
        title,
        description,
        category,
        location,
        event_date,
        event_time,
        capacity,
        banner || null,
        source_url || null,
        registration_url || null,
        registration_type === "external"
          ? "external"
          : "internal",
        eventId,
        organizer_id
      ]
    );

    res.json({
      success: true,
      message: "Event updated successfully"
    });

  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to update event",
      error: error.message
    });
  }
});


// ========================================
// DELETE EVENT
// DELETE /api/events/:id
// ========================================
router.delete(
  "/:id",
  protect,
  organizerOnly,
  async (req, res) => {
  try {

    const eventId = req.params.id;
    const organizer_id = req.user.id;

    // Check ownership
    const [events] = await db.query(
      `SELECT *
       FROM events
       WHERE id = ? AND organizer_id = ?`,
      [eventId, organizer_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found or you are not the organizer"
      });
    }

    // Delete registrations first
    await db.query(
      "DELETE FROM registrations WHERE event_id = ?",
      [eventId]
    );

    // Delete event
    await db.query(
      `DELETE FROM events
       WHERE id = ? AND organizer_id = ?`,
      [eventId, organizer_id]
    );

    res.json({
      success: true,
      message: "Event deleted successfully"
    });

  } catch (error) {

    console.error("DELETE EVENT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete event",
      error: error.message
    });
  }
});


// ========================================
// EXPORT ROUTER
// ========================================

module.exports = router;