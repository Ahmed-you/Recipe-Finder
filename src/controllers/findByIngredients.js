import express from "express";
// import fetch from "node-fetch";

const findByIngredients = express.Router();
findByIngredients.post("/", (req, res) => {
  const ingredientsArray = req.body.ings;

  if (!Array.isArray(ingredientsArray) || ingredientsArray.length === 0) {
    return res
      .status(400)
      .json({ error: "Please provide a non-empty array of ingredients" });
  }

  const ingredientsString = ingredientsArray.join(",");
  if (typeof ingredientsString !== "string") {
    throw new Error(`the ingredients must be type of 'string'`);
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  return fetch(
    `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsString}&number=10&ranking=2&ignorePantry=true&apiKey=${apiKey}`
  )
    .then((res) => res.json())

    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: error.message });
    });
});
export default findByIngredients;
