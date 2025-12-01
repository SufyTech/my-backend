require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const aiRoutes = require("./src/routes/ai.routes");
const authRoutes = require("./src/routes/auth.routes");
const contactRoutes = require("./src/routes/contact.routes");

const app = express();

// CORS & JSON middleware - MUST be before routes
const allowOrigins = [
  "https://codemind-ai-eight.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowOrigins,
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/api", contactRoutes);

// Root route
app.get("/", (req, res) => res.send("Hello World"));

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("MongoDB URI not found in .env");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
