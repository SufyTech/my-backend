// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");

const aiRoutes = require("./src/routes/ai.routes");
const authRoutes = require("./src/routes/auth.routes");
const contactRoutes = require("./src/routes/contact.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://codemind-ai-eight.vercel.app"
    ],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);


app.use(express.json());

// ----------------------
// Serve uploaded avatars
// ----------------------
app.use("/uploads", express.static("src/uploads"));

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/ai", aiRoutes);
app.use("/api", contactRoutes);
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);


app.get("/", (req, res) => res.send("Hello World"));

// ----------------------
// MongoDB connection
// ----------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
