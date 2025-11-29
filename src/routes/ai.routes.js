// src/routes/ai.routes.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth");

// Protected route: POST /ai/get-review
router.post("/get-review", authMiddleware, aiController.getReview);

module.exports = router;
