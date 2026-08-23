const express = require("express");
const router = express.Router();

const db = require("../config/db");

// Import middleware correctly
const authMiddleware = require("../middleware/authMiddleware");
const protect = authMiddleware.protect;

// ========================================
// GET MY NOTIFICATIONS
// GET /api/notifications
// ========================================

router.get("/", protect, async (req, res) => {
  try {
    const user_id = req.user.id;

    const [notifications] = await db.query(
      `SELECT
        notifications.id,
        notifications.message,
        notifications.type,
        notifications.is_read,
        notifications.created_at,
        events.id AS event_id,
        events.title AS event_title
       FROM notifications
       LEFT JOIN events
         ON notifications.event_id = events.id
       WHERE notifications.user_id = ?
       ORDER BY notifications.created_at DESC`,
      [user_id]
    );

    res.json(notifications);

  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
});


// ========================================
// MARK NOTIFICATION AS READ
// PUT /api/notifications/:id/read
// ========================================

router.put("/:id/read", protect, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const user_id = req.user.id;

    const [result] = await db.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE id = ?
       AND user_id = ?`,
      [notificationId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read"
    });

  } catch (error) {
    console.error("MARK NOTIFICATION ERROR:", error);

    res.status(500).json({
      message: "Failed to update notification",
      error: error.message
    });
  }
});


// ========================================
// MARK ALL NOTIFICATIONS AS READ
// PUT /api/notifications/read-all
// ========================================

router.put("/read-all", protect, async (req, res) => {
  try {
    const user_id = req.user.id;

    await db.query(
      `UPDATE notifications
       SET is_read = 1
       WHERE user_id = ?`,
      [user_id]
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });

  } catch (error) {
    console.error("READ ALL ERROR:", error);

    res.status(500).json({
      message: "Failed to update notifications",
      error: error.message
    });
  }
});


// ========================================
// DELETE NOTIFICATION
// DELETE /api/notifications/:id
// ========================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const user_id = req.user.id;

    const [result] = await db.query(
      `DELETE FROM notifications
       WHERE id = ?
       AND user_id = ?`,
      [notificationId, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted"
    });

  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message
    });
  }
});


module.exports = router;