import express from "express";
import { content } from "./Ai content/sysContent.js";
// making the ai remember the chat with the user
let conversationHistory = [
  {
    role: "system",
    content,
  },
];

//use ai to extract the ings from user input and suggest a recipe name
function getIngredients(userInput) {
  conversationHistory.push({ role: "user", content: userInput });

  // Enforce conversation history limits
  if (conversationHistory.length > 8) {
    conversationHistory = [
      conversationHistory[0], // Keep system message
      ...conversationHistory.slice(-7), // Keep last 7 messages
    ];
  }

  const requestData = {
    model: "google/gemma-3-27b-it:free",
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

// Response handling pipeline
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
    // console.log(parsed);

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

const findByIngredients = express.Router();
findByIngredients.post("/", (req, res) => {
  getIngredients(req.body.text)
    .then((responseData) => {
      if (
        responseData.ready == true ||
        responseData.search_mode == "recipe_name"
      ) {
        console.log(responseData.recipe_name);
      }
      console.log();

      res.json(responseData);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    });
  // if (!Array.isArray(ingredientsArray) || ingredientsArray.length === 0) {
  //   return res
  //     .status(400)
  //     .json({ error: "Please provide a non-empty array of ingredients" });
  // }

  // const ingredientsString = ingredientsArray.join(",");
  // if (typeof ingredientsString !== "string") {
  //   return res
  //     .status(400)
  //     .json({ error: "the ingredients must be type of 'string'" });
  // }

  // const apiKey = process.env.SPOONACULAR_API_KEY;
  // return fetch(
  //   `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=10&ranking=2&ignorePantry=true&apiKey=${apiKey}`
  // )
  //   .then((res) => res.json())

  //   .then((result) => {
  //     res.json(result);
  //   })
  //   .catch((error) => {
  //     console.error(error);
  //     res.status(500).json({ error: error.message });
  //   });
});

export default findByIngredients;
