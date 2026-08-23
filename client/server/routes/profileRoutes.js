const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const db = require("../config/db");
const { protect } = require("../middleware/authMiddleware");


// ========================================
// MULTER CONFIGURATION
// ========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1E9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});


// ========================================
// GET MY PROFILE
// GET /api/profile
// ========================================

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query(
      `SELECT
        id,
        name,
        email,
        phone,
        role,
        profile_photo,
        bio,
        latitude,
        longitude,
        location_city,
        location_state,
        state_id,
        district_id,
        location_id,
        created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(users[0]);

  } catch (error) {

    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch profile"
    });
  }
});


// ========================================
// UPLOAD PROFILE PHOTO
// POST /api/profile/photo
// ========================================

router.post(
  "/photo",
  protect,
  upload.single("profile_photo"),
  async (req, res) => {

    try {

      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          message: "Please select an image"
        });
      }

      const photoPath =
        `/uploads/${req.file.filename}`;

      await db.query(
        `UPDATE users
         SET profile_photo = ?
         WHERE id = ?`,
        [
          photoPath,
          userId
        ]
      );

      res.json({
        success: true,
        message: "Profile photo updated successfully",
        profile_photo: photoPath
      });

    } catch (error) {

      console.error("PROFILE PHOTO ERROR:", error);

      res.status(500).json({
        message: "Failed to upload profile photo",
        error: error.message
      });
    }
  }
);


// ========================================
// UPDATE PROFILE
// PUT /api/profile
// ========================================

router.put("/", protect, async (req, res) => {
  try {

    const userId = req.user.id;

    const {
      name,
      phone,
      bio
    } = req.body;

    console.log("UPDATE PROFILE");
    console.log("USER ID:", userId);
    console.log("BODY:", req.body);

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const [result] = await db.query(
      `UPDATE users
       SET name = ?,
           phone = ?,
           bio = ?
       WHERE id = ?`,
      [
        name.trim(),
        phone || null,
        bio || null,
        userId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const [users] = await db.query(
      `SELECT
        id,
        name,
        email,
        phone,
        role,
        profile_photo,
        bio,
        latitude,
        longitude,
        location_city,
        location_state,
        state_id,
        district_id,
        location_id,
        created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: users[0]
    });

  } catch (error) {

    console.error("UPDATE PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to update profile",
      error: error.message
    });
  }
});


// ========================================
// SAVE USER LOCATION
// POST /api/profile/location
// ========================================

router.post("/location", protect, async (req, res) => {

  console.log("🔥 LOCATION ROUTE HIT");
  console.log("USER:", req.user);
  console.log("BODY:", req.body);

  try {

    const userId = req.user.id;

    const {
      latitude,
      longitude
    } = req.body;

    // ----------------------------------------
    // VALIDATE COORDINATES
    // ----------------------------------------

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required"
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates"
      });
    }


    // ----------------------------------------
    // DEFAULT VALUES
    // ----------------------------------------

    let city = null;
    let state = null;
    let district = null;

    let stateId = null;
    let districtId = null;
    let locationId = null;


    // ----------------------------------------
    // REVERSE GEOCODING
    // ----------------------------------------

    try {

      const url =
        `https://nominatim.openstreetmap.org/reverse` +
        `?format=jsonv2` +
        `&lat=${lat}` +
        `&lon=${lon}` +
        `&zoom=18` +
        `&addressdetails=1`;

      const geoResponse = await fetch(url, {
        headers: {
          "User-Agent": "EventEase-India/1.0"
        }
      });

      if (geoResponse.ok) {

        const geoData =
          await geoResponse.json();

        const address =
          geoData.address || {};

        state =
          address.state ||
          null;

        district =
          address.state_district ||
          address.district ||
          address.county ||
          null;

        city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          address.suburb ||
          null;

        console.log("📍 REVERSE GEOCODE:", {
          state,
          district,
          city
        });

      }

    } catch (geoError) {

      console.error(
        "REVERSE GEOCODING ERROR:",
        geoError.message
      );

      // GPS still gets saved even if geocoding fails
    }


    // ----------------------------------------
    // FIND STATE
    // ----------------------------------------

    if (state) {

      const [stateRows] = await db.query(
        `SELECT id, name
         FROM states
         WHERE LOWER(TRIM(name)) =
               LOWER(TRIM(?))
         LIMIT 1`,
        [state]
      );

      if (stateRows.length > 0) {

        stateId = stateRows[0].id;

      } else {

        // Some external names may contain
        // "The " prefix.
        const cleanedState =
          state
            .replace(/^The\s+/i, "")
            .trim();

        const [cleanStateRows] =
          await db.query(
            `SELECT id, name
             FROM states
             WHERE LOWER(TRIM(name)) =
                   LOWER(TRIM(?))
             LIMIT 1`,
            [cleanedState]
          );

        if (cleanStateRows.length > 0) {
          stateId = cleanStateRows[0].id;
        }
      }
    }


    // ----------------------------------------
    // FIND DISTRICT
    // ----------------------------------------

    if (stateId && district) {

      const [districtRows] = await db.query(
        `SELECT id, name
         FROM districts
         WHERE state_id = ?
           AND LOWER(TRIM(name)) =
               LOWER(TRIM(?))
         LIMIT 1`,
        [
          stateId,
          district
        ]
      );

      if (districtRows.length > 0) {

        districtId =
          districtRows[0].id;

      } else {

        // Try partial match
        const [districtLikeRows] =
          await db.query(
            `SELECT id, name
             FROM districts
             WHERE state_id = ?
               AND LOWER(name) LIKE LOWER(?)
             LIMIT 1`,
            [
              stateId,
              `%${district}%`
            ]
          );

        if (districtLikeRows.length > 0) {
          districtId =
            districtLikeRows[0].id;
        }
      }
    }


    // ----------------------------------------
    // FIND CITY / TOWN / VILLAGE
    // ----------------------------------------

    if (districtId && city) {

      const [locationRows] = await db.query(
        `SELECT id, name, type
         FROM locations
         WHERE district_id = ?
           AND LOWER(TRIM(name)) =
               LOWER(TRIM(?))
         LIMIT 1`,
        [
          districtId,
          city
        ]
      );

      if (locationRows.length > 0) {

        locationId =
          locationRows[0].id;

      } else {

        // Partial match fallback
        const [locationLikeRows] =
          await db.query(
            `SELECT id, name, type
             FROM locations
             WHERE district_id = ?
               AND LOWER(name) LIKE LOWER(?)
             LIMIT 1`,
            [
              districtId,
              `%${city}%`
            ]
          );

        if (locationLikeRows.length > 0) {
          locationId =
            locationLikeRows[0].id;
        }
      }
    }


    // ----------------------------------------
    // SAVE USER LOCATION
    // ----------------------------------------

    await db.query(
      `UPDATE users
       SET latitude = ?,
           longitude = ?,
           location_city = ?,
           location_state = ?,
           state_id = ?,
           district_id = ?,
           location_id = ?
       WHERE id = ?`,
      [
        lat,
        lon,
        city,
        state,
        stateId,
        districtId,
        locationId,
        userId
      ]
    );


    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    res.json({
      success: true,
      message: "Location saved successfully",

      location: {
        latitude: lat,
        longitude: lon,
        city,
        district,
        state,
        state_id: stateId,
        district_id: districtId,
        location_id: locationId
      }
    });

  } catch (error) {

    console.error(
      "SAVE LOCATION ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save location",
      error: error.message
    });
  }
});

// ========================================
// GET ALL STATES
// GET /api/profile/locations/states
// ========================================

router.get("/locations/states", protect, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, type
       FROM states
       ORDER BY name ASC`
    );

    res.json(rows);

  } catch (error) {
    console.error("GET STATES ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch states"
    });
  }
});


// ========================================
// GET DISTRICTS BY STATE
// GET /api/profile/locations/districts/:stateId
// ========================================

router.get(
  "/locations/districts/:stateId",
  protect,
  async (req, res) => {
    try {
      const stateId = req.params.stateId;

      const [rows] = await db.query(
        `SELECT id, name
         FROM districts
         WHERE state_id = ?
         ORDER BY name ASC`,
        [stateId]
      );

      res.json(rows);

    } catch (error) {
      console.error(
        "GET DISTRICTS ERROR:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch districts"
      });
    }
  }
);


// ========================================
// GET LOCATIONS BY DISTRICT + SEARCH
// GET /api/profile/locations/search
// ========================================

router.get(
  "/locations/search",
  protect,
  async (req, res) => {
    try {
      const { districtId, search = "" } = req.query;

      if (!districtId) {
        return res.status(400).json({
          message: "District is required"
        });
      }

      const cleanSearch = String(search).trim();

      let query = `
        SELECT id, name, type
        FROM locations
        WHERE district_id = ?
      `;

      const params = [districtId];

      // Search only when user typed something
      if (cleanSearch !== "") {
        query += `
          AND name LIKE ?
        `;

        params.push(`%${cleanSearch}%`);
      }

      query += `
        ORDER BY name ASC
        LIMIT 1000
      `;

      const [rows] = await db.query(
        query,
        params
      );

      res.json(rows);

    } catch (error) {

      console.error(
        "SEARCH LOCATIONS ERROR:",
        error
      );

      res.status(500).json({
        message: "Failed to fetch locations"
      });
    }
  }
);


// ========================================
// SAVE MANUAL LOCATION
// POST /api/profile/manual-location
// ========================================

router.post(
  "/manual-location",
  protect,
  async (req, res) => {
    try {

      const userId = req.user.id;

      const {
        stateId,
        districtId,
        locationId
      } = req.body;

      if (
        !stateId ||
        !districtId ||
        !locationId
      ) {
        return res.status(400).json({
          message:
            "State, district and location are required"
        });
      }


      // Verify district belongs to state
      const [districtRows] = await db.query(
        `SELECT id, name
         FROM districts
         WHERE id = ?
           AND state_id = ?
         LIMIT 1`,
        [
          districtId,
          stateId
        ]
      );

      if (districtRows.length === 0) {
        return res.status(400).json({
          message: "Invalid district"
        });
      }


      // Verify location belongs to district
      const [locationRows] = await db.query(
        `SELECT id, name, type
         FROM locations
         WHERE id = ?
           AND district_id = ?
         LIMIT 1`,
        [
          locationId,
          districtId
        ]
      );

      if (locationRows.length === 0) {
        return res.status(400).json({
          message: "Invalid location"
        });
      }


      const [stateRows] = await db.query(
        `SELECT id, name
         FROM states
         WHERE id = ?
         LIMIT 1`,
        [stateId]
      );

      if (stateRows.length === 0) {
        return res.status(400).json({
          message: "Invalid state"
        });
      }


      const stateName =
        stateRows[0].name;

      const districtName =
        districtRows[0].name;

      const locationName =
        locationRows[0].name;


      // Save manual location
      await db.query(
        `UPDATE users
         SET state_id = ?,
             district_id = ?,
             location_id = ?,
             location_city = ?,
             location_state = ?
         WHERE id = ?`,
        [
          stateId,
          districtId,
          locationId,
          locationName,
          stateName,
          userId
        ]
      );


      res.json({
        success: true,
        message: "Location updated successfully",

        location: {
          city: locationName,
          district: districtName,
          state: stateName,
          state_id: stateId,
          district_id: districtId,
          location_id: locationId
        }
      });

    } catch (error) {

      console.error(
        "MANUAL LOCATION ERROR:",
        error
      );

      res.status(500).json({
        message: "Failed to update location"
      });
    }
  }
);

module.exports = router;