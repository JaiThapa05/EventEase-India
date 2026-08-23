const express = require("express");

const {
  register,
  login
} = require("../controllers/authController");

const router = express.Router();


// ========================================
// REGISTER
// POST /api/auth/register
// ========================================

router.post("/register", register);


// ========================================
// LOGIN
// POST /api/auth/login
// ========================================

router.post("/login", login);


module.exports = router;