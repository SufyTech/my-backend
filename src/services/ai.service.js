// src/services/ai.service.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

async function generateContent(code) {
  try {
    if (!code || typeof code !== "string") {
      throw new Error("Code must be a string");
    }

    // 🔥 Detect language from code
    function detectLanguage(code) {
      const trimmed = code.trim();

      if (
        trimmed.startsWith("import React") ||
        trimmed.includes("useState(") ||
        trimmed.includes("return (")
      )
        return "javascript";

      if (
        trimmed.startsWith("public class") ||
        trimmed.includes("System.out.println")
      )
        return "java";

      if (trimmed.startsWith("def ") || trimmed.includes("print("))
        return "python";

      if (trimmed.includes("#include") || trimmed.includes("printf("))
        return "c";

      if (trimmed.includes("<html") || trimmed.includes("<body>"))
        return "html";

      return "unknown";
    }

    const detectedLanguage = detectLanguage(code);

    const prompt = `
You are a Senior Code Reviewer with 7+ years of experience.

Your role is to analyze, review, and improve this code in a professional, human-readable format. Focus on:
• Code Quality: Clean, maintainable, well-structured code
• Best Practices: Industry-standard approaches
• Efficiency & Performance: Optimize execution & resource usage
• Error Detection: Spot bugs, security risks, logical flaws
• Scalability: Advice for future growth
• Readability & Maintainability: Easy to understand and modify

Guidelines:
1. Provide constructive feedback, explain why changes are needed
2. Suggest code improvements, including refactored examples if possible
3. Identify unnecessary complexity and potential performance issues
4. Ensure security compliance
5. Promote consistency in formatting, naming, and style
6. Encourage modern practices, latest frameworks, or patterns
7. Include final note summarizing overall quality and next steps

Format the output in this style:

❌ Bad Code:
\`\`\`<language>
[original code here]
\`\`\`

🔍 Issues:
• Issue 1
• Issue 2
...

✅ Recommended Fix:
\`\`\`<language>
[corrected code here]
\`\`\`

💡 Improvements:
• Suggestion 1
• Suggestion 2
...

Final Note:
[summary]

Code to review:
\`\`\`
${code}
\`\`\`
`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = result.response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Fallback: raw text, split into professional sections
      const sections = text.split(
        /(?=❌ Bad Code:|🔍 Issues:|✅ Recommended Fix:|💡 Improvements:|Final Note:)/
      );

      const reviews = sections.map((section) => {
        const lines = section.split("\n");
        const titleLine = lines[0].trim();
        const description = lines.slice(1).join("\n").trim(); // preserve formatting
        return {
          type: "Best Practice",
          title: titleLine,
          description,
        };
      });

      return { reviews };
    }

    // Convert parsed JSON into reviews array
    const reviews = [];

    if (Array.isArray(parsed.issues)) {
      parsed.issues.forEach((issue, i) => {
        reviews.push({
          type: "Best Practice",
          title: `Issue ${i + 1}`,
          description: issue,
          codeSuggestion: parsed.recommendedFix || "",
        });
      });
    }

    if (Array.isArray(parsed.improvements)) {
      parsed.improvements.forEach((imp, i) => {
        reviews.push({
          type: "Best Practice",
          title: `Improvement ${i + 1}`,
          description: imp,
        });
      });
    }

    if (parsed.finalNote) {
      reviews.push({
        type: "Best Practice",
        title: "Final Note",
        description: parsed.finalNote,
      });
    }

    return { reviews };
  } catch (err) {
    console.error("AI Service Error:", err);
    return {
      reviews: [
        {
          type: "Bug Fix",
          title: "Error",
          description: "AI processing failed.",
        },
      ],
    };
  }
}

module.exports = generateContent;
