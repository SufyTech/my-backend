const User = require("../models/user.model");
const aiService = require("../services/ai.service");


exports.getReview = async (req, res) => {
  const { code, language, description } = req.body;
  const userId = req.user.id;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    const review = await aiService(code);

    await User.findByIdAndUpdate(userId, {
      $push: {
        reviewHistory: {
          code,
          language,
          description,
          result: review,
          createdAt: new Date(),
        },
      },
    });

    res.json(review);
  } catch (err) {
    console.error("AI Controller Error:", err);
    res.status(500).json({ error: "AI processing failed." });
  }
};
