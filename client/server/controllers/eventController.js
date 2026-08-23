const db = require("../config/db");

const createEvent = async (req, res) => {
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
    } = req.body;

    // Validate
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
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Only organizer can create events
    if (req.user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only organizers can create events",
      });
    }

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
        banner
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description,
        category,
        location,
        event_date,
        event_time,
        capacity,
        banner || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully 🎉",
      eventId: result.insertId,
    });

  } catch (error) {
    console.error("Create event error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT 
        events.*,
        users.name AS organizer_name
       FROM events
       JOIN users ON events.organizer_id = users.id
       ORDER BY event_date ASC, event_time ASC`
    );

    res.json({
      success: true,
      events,
    });

  } catch (error) {
    console.error("Get events error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [events] = await db.query(
      `SELECT 
        events.*,
        users.name AS organizer_name
       FROM events
       JOIN users ON events.organizer_id = users.id
       WHERE events.id = ?`,
      [id]
    );

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      event: events[0],
    });

  } catch (error) {
    console.error("Get event error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  createEvent,
  getEvents,
  getEventById,
};