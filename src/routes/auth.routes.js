const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// ----------------------
// Multer disk storage for avatars
// ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/avatars"); // save avatars here
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`); // unique filename
  },
});

const upload = multer({ storage });

// ----------------------
// AUTH ROUTES
// ----------------------
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getMe);

// UPDATE PROFILE
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("avatar"), // handle avatar upload
  authController.updateProfile
);

router.put("/update-password", authMiddleware, authController.updatePassword);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);
router.post("/google-login", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
