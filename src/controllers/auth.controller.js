const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

// ----------------------
// NORMAL SIGNUP
// ----------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      google: false,
    });

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // remove password from response
    user.password = undefined;

    // send welcome email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password if 2FA
      },
    });

    const mailOptions = {
      from: `"CodeAI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to CodeAI!",
      html: `<h1>Hello ${user.name}!</h1>
             <p>Thanks for signing up for CodeAI. We're excited to have you onboard!</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Email not sent:", err);
      else console.log("Email sent:", info.response);
    });

    res.json({
      message: "Signup successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar || "/default-avatar.png",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------------
// NORMAL LOGIN
// ----------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    if (user.google && !user.password)
      return res.status(400).json({
        error: "Please login with Google OAuth instead",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.password = undefined;

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar
          ? `${process.env.BACKEND_URL}/${user.avatar}`
          : `${process.env.BACKEND_URL}/uploads/avatars/default-avatar.png`,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------------
// UPDATE PROFILE
// ----------------------

// UPDATE PROFILE
// ----------------------
// UPDATE PROFILE
// ----------------------
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;

    // Save avatar if uploaded
    if (req.file) {
      user.avatar = `uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar
          ? `${process.env.BACKEND_URL}/${user.avatar}`
          : `${process.env.BACKEND_URL}/uploads/avatars/default-avatar.png`,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ----------------------
// UPDATE PASSWORD
// ----------------------
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current, newPass } = req.body;

    if (!current || !newPass)
      return res.status(400).json({ error: "All fields are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ error: "Failed to update password" });
  }
};

// ----------------------
// DELETE ACCOUNT
// ----------------------
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// ----------------------
// GOOGLE LOGIN / SIGNUP
// ----------------------
exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) return res.status(400).json({ error: "Token is required" });

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new Google user with dummy password
      const dummyPassword = bcrypt.hashSync(
        Math.random().toString(36).slice(-8),
        10
      );
      user = await User.create({
        name,
        email,
        password: dummyPassword,
        avatar: picture,
        google: true,
      });
    }

    user.password = undefined;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar || "/default-avatar.png",
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ error: "Google login failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Styled Email Template
    const mailOptions = {
      from: `"CodeAI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset Your CodeAI Password",
      html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #1e40af;">Hello ${user.name},</h2>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" target="_blank" style="
          display: inline-block;
          padding: 12px 24px;
          margin: 20px 0;
          font-size: 16px;
          color: #fff;
          background-color: #1e40af;
          border-radius: 8px;
          text-decoration: none;
        ">Reset Password</a>
        <p style="color: gray; font-size: 12px;">This link will expire in 1 hour.</p>
      </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Reset email not sent:", err);
      else console.log("Reset email sent:", info.response);
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------------
// RESET PASSWORD
// ----------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "All fields are required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // 🔹 Send confirmation email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CodeAI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Successful",
      html: `<p>Hello ${user.name},</p>
             <p>Your password has been successfully reset.</p>
             <p>If you did not perform this action, please contact support immediately.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Confirmation email not sent:", err);
      else console.log("Confirmation email sent:", info.response);
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar
          ? `${process.env.BACKEND_URL}/${user.avatar}`
          : `${process.env.BACKEND_URL}/uploads/avatars/default-avatar.png`,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = exports;
