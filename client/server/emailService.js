const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendContactEmail = async ({
  name,
  email,
  subject,
  message
}) => {

  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: process.env.EMAIL_USER,

    replyTo: email,

    subject: `EventEase Contact: ${subject}`,

    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">

        <h2 style="color: #4f46e5;">
          📩 New Contact Message
        </h2>

        <hr />

        <p>
          <strong>Name:</strong> ${name}
        </p>

        <p>
          <strong>Email:</strong> ${email}
        </p>

        <p>
          <strong>Subject:</strong> ${subject}
        </p>

        <h3>Message:</h3>

        <div style="
          background: #f8fafc;
          padding: 15px;
          border-radius: 10px;
        ">
          ${message}
        </div>

        <hr />

        <p style="color: #64748b;">
          This message was sent from EventEase India Contact Form.
        </p>

      </div>
    `
  });
};

module.exports = sendContactEmail;