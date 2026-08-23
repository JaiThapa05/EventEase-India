const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `EventEase Contact Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `
    });

    console.log("✅ CONTACT EMAIL SENT");

    res.json({
      success: true,
      message: "Message sent successfully!"
    });

  } catch (error) {
    console.error("❌ CONTACT EMAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
});

module.exports = router;