// making the ai remember the chat with the user
import { content } from "./sysContent.js";

let conversationHistory = [
  {
    role: "system",
    content,
  },
];

// use trained ai model to extract the ingredients or recipe name  from user input and suggest a recipe name
export function AiExtractorAssistant(userInput) {
  conversationHistory.push({ role: "user", content: userInput });

  // Enforce conversation history limits
  if (conversationHistory.length > 8) {
    conversationHistory = [
      conversationHistory[0], // Keep system message
      ...conversationHistory.slice(-7), // Keep last 7 messages
    ];
  }

  const requestData = {
    model: "google/gemini-2.0-flash-001",
    messages: conversationHistory,
    response_format: { type: "json_object" },
    temperature: 0.3,
  };

  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify(requestData),
  })
    .then(handleResponse)
    .then(validateJsonStructure)
    .catch(handleErrors);
}
const handleResponse = (response) => {
  if (!response.ok) {
    return response.text().then((text) => {
      throw new Error(`API Error: ${response.status} - ${text}`);
    });
  }
  return response.json();
};

const validateJsonStructure = (data) => {
  try {
    const content = extractJsonContent(data);
    const parsed = JSON.parse(content);

    // Validate required structure
    const isValid = [
      "recipe_name" in parsed,
      "ingredients" in parsed && Array.isArray(parsed.ingredients),
      "msg" in parsed && typeof parsed.msg === "string",
      "ready" in parsed && typeof parsed.ready === "boolean",
      "search_mode" in parsed,
    ].every((check) => check === true);

    if (!isValid) throw new Error("Invalid response structure");

    // Clean message content
    parsed.msg = parsed.msg
      .replace(/[\n\*\-•]/g, " ") // Remove forbidden characters
      .replace(/\s{2,}/g, " ") // Collapse multiple spaces
      .trim();

    conversationHistory.push({
      role: "assistant",
      content: JSON.stringify(parsed),
    });
    return parsed;
  } catch (error) {
    console.error("Validation failed:", error);
    return fallbackResponse();
  }
};

const extractJsonContent = (data) => {
  const rawContent = data.choices[0].message.content;
  return rawContent
    .replace(/^[^{]*/, "") // Remove any text before JSON
    .replace(/[^}]*$/, "") // Remove any text after JSON
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

const handleErrors = (error) => {
  console.error("Processing error:", error);
  return fallbackResponse();
};

const fallbackResponse = () => ({
  recipe_name: "",
  ingredients: [],
  msg: "Let's focus on recipes! How can I assist with your cooking needs? 🍳",
  ready: false,
  search_mode: "",
});

export default AiExtractorAssistant;
