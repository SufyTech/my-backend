// src/controllers/contact.controller.js
const nodemailer = require("nodemailer");

exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, email, message) are required",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    // ⭐ PROFESSIONAL HTML EMAIL TEMPLATE
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0; padding:0; background:#f5f7fb; font-family:Arial,sans-serif; color:#111827;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:30px auto;">
      <tr>
        <td style="background:#ffffff; padding:30px; border:1px solid #e5e7eb;">
          
          <!-- Header -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="text-align:center; padding-bottom:20px;">
                <!-- Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#4f46e5">
                  <path d="M12 2l10 6v12l-10 6-10-6V8l10-6z"/>
                </svg>
                <h2 style="margin:10px 0 5px; font-size:20px; font-weight:bold;">📩 New Contact Form Message</h2>
                <p style="margin:0; font-size:14px; color:#6b7280;">Someone just reached out via your website.</p>
              </td>
            </tr>
          </table>

          <!-- User Info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; background:#f9fafb; padding:15px; border:1px solid #e5e7eb;">
            <tr>
              <td style="font-size:14px; color:#111827; padding-bottom:5px;"><strong>Name:</strong> ${name}</td>
            </tr>
            <tr>
              <td style="font-size:14px; color:#111827;"><strong>Email:</strong> ${email}</td>
            </tr>
          </table>

          <!-- Message -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; background:#eef2ff; border-left:4px solid #4f46e5; padding:15px;">
            <tr>
              <td style="font-size:14px; color:#1f2937; line-height:1.5; white-space:pre-line;">
                ${message}
              </td>
            </tr>
          </table>

          <!-- Acknowledgment -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px; background:#4f46e5; padding:20px; text-align:center;">
            <tr>
              <td>
                <h3 style="margin:0; font-size:16px; color:#ffffff;">✨ Message Received!</h3>
                <p style="margin:5px 0 0; font-size:13px; color:#ffffff;">We’ll get back to the sender shortly. Keep up the great work! 💼</p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:15px;">
            <tr>
              <td style="font-size:12px; color:#9ca3af; text-align:center;">
                This message was sent from your website’s contact form.
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
`;

    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `📬 New Message from ${name}`,
      html: htmlTemplate, // ⭐ Use the new HTML template
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ Contact Form Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: error.message,
    });
  }
};
