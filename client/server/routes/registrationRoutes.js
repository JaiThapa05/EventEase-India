const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");
console.log("PROTECT TYPE:", typeof protect);

// ========================================
// REGISTER FOR EVENT
// POST /api/registrations
// ========================================

router.post("/", protect, async (req, res) => {
  try {
    console.log("🔥 REGISTRATION REQUEST RECEIVED");
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { event_id } = req.body;

    const user_id = req.user.id;

    // baaki code...

    if (!event_id) {
      return res.status(400).json({
        message: "Event ID is required"
      });
    }


    // Check event exists
    const [events] = await db.query(
      "SELECT * FROM events WHERE id = ?",
      [event_id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        message: "Event not found"
      });
    }


    // Check already registered
    const [existing] = await db.query(
      `SELECT * FROM registrations
       WHERE event_id = ? AND user_id = ?`,
      [event_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "You are already registered for this event"
      });
    }


    // Check capacity
    const [registrationCount] = await db.query(
      `SELECT COUNT(*) AS total
       FROM registrations
       WHERE event_id = ? AND status = 'registered'`,
      [event_id]
    );

    const registeredUsers = registrationCount[0].total;
    const capacity = events[0].capacity;


    if (capacity && registeredUsers >= capacity) {
      return res.status(400).json({
        message: "Event is full"
      });
    }


    // Create registration
    const [result] = await db.query(
      `INSERT INTO registrations
       (event_id, user_id, status)
       VALUES (?, ?, 'registered')`,
      [event_id, user_id]
    );
  
    // ========================================
    // CREATE NOTIFICATION
    // ========================================

    await db.query(
    `INSERT INTO notifications
    (user_id, event_id, message, type)
    VALUES (?, ?, ?, ?)`,
   [
    user_id,
    event_id,
    `🎉 Successfully registered for ${events[0].title}`,
    "registration"
   ]
   );

   // ========================================
// NOTIFY ORGANIZER
// ========================================

const organizer_id = events[0].organizer_id;

// Get participant name
const [users] = await db.query(
  `SELECT name
   FROM users
   WHERE id = ?`,
  [user_id]
);

const participantName = users[0]?.name || "A participant";

await db.query(
  `INSERT INTO notifications
   (user_id, event_id, message, type)
   VALUES (?, ?, ?, ?)`,
  [
    organizer_id,
    event_id,
    `🎉 ${participantName} registered for ${events[0].title}`,
    "new_registration"
  ]
);


   // ========================================
   // SEND RESPONSE
   // ========================================

    res.status(201).json({
      success: true,
      message: "Successfully registered for event",
      registrationId: result.insertId
    });

  } catch (error) {

    console.error("REGISTRATION ERROR:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
});
// ========================================
// GET MY REGISTERED EVENTS
// GET /api/registrations/my-events
// ========================================
router.get("/my-events", protect, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT 
        registrations.id AS registration_id,
        registrations.registered_at,
        registrations.status,
        events.id AS event_id,
        events.title,
        events.description,
        events.category,
        events.location,
        events.event_date,
        events.event_time,
        events.capacity,
        events.banner
      FROM registrations
      INNER JOIN events
        ON registrations.event_id = events.id
      WHERE registrations.user_id = ?
        AND registrations.status = 'registered'
      ORDER BY events.event_date ASC`,
      [user_id]
    );

    res.json(rows);

  } catch (error) {
    console.error("MY EVENTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch registered events",
      error: error.message
    });
  }
});
// ========================================
// GET SINGLE REGISTRATION
// GET /api/registrations/:id
// ========================================
router.get("/:id", protect, async (req, res) => {
  try {
    const registrationId = req.params.id;
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT
        registrations.id AS registration_id,
        registrations.registered_at,
        registrations.status,
        events.id AS event_id,
        events.title,
        events.description,
        events.category,
        events.location,
        events.event_date,
        events.event_time,
        events.capacity,
        events.banner
      FROM registrations
      INNER JOIN events
        ON registrations.event_id = events.id
      WHERE registrations.id = ?
        AND registrations.user_id = ?`,
      [registrationId, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Registration not found"
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("GET REGISTRATION ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch registration",
      error: error.message
    });
  }
});
// ========================================
// CANCEL REGISTRATION
// DELETE /api/registrations/:id
// ========================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const registrationId = req.params.id;
    const user_id = req.user.id;

    // ========================================
    // GET REGISTRATION + EVENT DETAILS
    // ========================================

    const [registrations] = await db.query(
  `SELECT
    registrations.event_id,
    events.title AS event_title,
    events.organizer_id
   FROM registrations
   INNER JOIN events
     ON registrations.event_id = events.id
   WHERE registrations.id = ?
     AND registrations.user_id = ?`,
  [registrationId, user_id]
);

    if (registrations.length === 0) {
      return res.status(404).json({
        message: "Registration not found"
      });
    }

    const eventId = registrations[0].event_id;
    const eventTitle = registrations[0].event_title;
    const organizer_id = registrations[0].organizer_id;
   
    // Get participant name
    const [users] = await db.query(
    `SELECT name
     FROM users
    WHERE id = ?`,
    [user_id]
    );

    const participantName = users[0]?.name || "A participant";

    // ========================================
    // DELETE REGISTRATION
    // ========================================

    const [result] = await db.query(
      `DELETE FROM registrations
       WHERE id = ? AND user_id = ?`,
      [registrationId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Registration not found"
      });
    }


    // ========================================
    // CREATE CANCELLATION NOTIFICATION
    // ========================================

    await db.query(
      `INSERT INTO notifications
       (user_id, event_id, message, type)
       VALUES (?, ?, ?, ?)`,
      [
        user_id,
        eventId,
        `❌ Your registration for ${eventTitle} has been cancelled.`,
        "cancelled"
      ]
    );

    // ========================================
// NOTIFY ORGANIZER
// ========================================

await db.query(
  `INSERT INTO notifications
   (user_id, event_id, message, type)
   VALUES (?, ?, ?, ?)`,
  [
    organizer_id,
    eventId,
    `❌ ${participantName} cancelled their registration for ${eventTitle}`,
    "registration_cancelled"
  ]
);


    // ========================================
    // SEND RESPONSE
    // ========================================

    res.json({
      success: true,
      message: "Registration cancelled successfully"
    });

  } catch (error) {

    console.error("CANCEL REGISTRATION ERROR:", error);

    res.status(500).json({
      message: "Failed to cancel registration",
      error: error.message
    });
  }
});


// ========================================
// START EXTERNAL REGISTRATION
// POST /api/registrations/external-start
// ========================================

router.post(
  "/external-start",
  protect,
  async (req, res) => {
    try {
      const user_id = req.user.id;
      const { event_id } = req.body;

      console.log(
        "🔥 EXTERNAL REGISTRATION START"
      );
      console.log("USER:", user_id);
      console.log("EVENT:", event_id);

      if (!event_id) {
        return res.status(400).json({
          message: "Event ID is required",
        });
      }

      // Get event
      const [events] = await db.query(
        `SELECT
          id,
          title,
          registration_url,
          capacity
         FROM events
         WHERE id = ?`,
        [event_id]
      );

      if (events.length === 0) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      const event = events[0];

      if (!event.registration_url) {
        return res.status(400).json({
          message:
            "This event does not have an external registration link.",
        });
      }

      // Already registered / pending
      const [existing] = await db.query(
        `SELECT
          id,
          status
         FROM registrations
         WHERE event_id = ?
           AND user_id = ?`,
        [
          event_id,
          user_id,
        ]
      );

      if (existing.length > 0) {
        return res.json({
          success: true,
          registrationId:
            existing[0].id,
          status:
            existing[0].status,
          registrationUrl:
            event.registration_url,
        });
      }

      // Create PENDING registration
      const [result] = await db.query(
        `INSERT INTO registrations
         (event_id, user_id, status)
         VALUES (?, ?, 'pending')`,
        [
          event_id,
          user_id,
        ]
      );

      res.status(201).json({
        success: true,
        registrationId:
          result.insertId,
        status: "pending",
        registrationUrl:
          event.registration_url,
      });

    } catch (error) {
      console.error(
        "EXTERNAL REGISTRATION START ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Unable to start external registration",
        error: error.message,
      });
    }
  }
);

// ========================================
// CONFIRM EXTERNAL REGISTRATION
// POST /api/registrations/external-confirm
// ========================================

router.post(
  "/external-confirm",
  protect,
  async (req, res) => {
    try {
      const user_id = req.user.id;

      const {
        registrationId
      } = req.body;

      if (!registrationId) {
        return res.status(400).json({
          message:
            "Registration ID is required",
        });
      }

      // Verify registration belongs to user
      const [rows] = await db.query(
        `SELECT
          id,
          event_id,
          status
         FROM registrations
         WHERE id = ?
           AND user_id = ?`,
        [
          registrationId,
          user_id,
        ]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          message:
            "Registration not found",
        });
      }

      // IMPORTANT:
      // This endpoint must only be called
      // after actual external verification.
      // For now it is available for integration.

      await db.query(
        `UPDATE registrations
         SET status = 'registered'
         WHERE id = ?
           AND user_id = ?`,
        [
          registrationId,
          user_id,
        ]
      );

      res.json({
        success: true,
        message:
          "External registration confirmed",
      });

    } catch (error) {
      console.error(
        "EXTERNAL CONFIRM ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Unable to confirm registration",
        error: error.message,
      });
    }
  }
);

module.exports = router;