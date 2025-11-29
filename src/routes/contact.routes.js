const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contact.controller");

router.post("/contact", sendContactMessage);

module.exports = router;
