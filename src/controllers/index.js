import AiExtractorAssistant from "../AiExtracterAssistantModule /AiExtracterAssistant.js";

// Response handling pipeline

const findRecipes = (req, res) => {
  AiExtractorAssistant(  req.query.textInput)
    .then((responseData) => {
      const apiKey = process.env.SPOONACULAR_API_KEY;
      if (
        responseData.ready == true ||
        responseData.search_mode == "recipe_name"
      ) {
        const formattedQuery = encodeURIComponent(responseData.recipe_name)
          .replace(/%20/g, "+")
          .replace(/'/g, "%27");
        return fetch(
          `https://api.spoonacular.com/recipes/complexSearch?query=${formattedQuery}&number=5&instructionsRequired=true&addRecipeInformation=true&apiKey=${apiKey}`
        )
          .then((res) => res.json())

          .then((result) => {
            result.AIData = responseData;
            res.json(result);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: error.message });
          });
      } else if (
        responseData.ready == true ||
        responseData.search_mode == "ingredients"
      ) {
        const ingredientsString = responseData.ingredients.join(",");
        return fetch(
          `https://api.spoonacular.com/recipes/findRecipes?ingredients=${ingredientsString}&number=10&ranking=2&instructionsRequired=true&ignorePantry=true&apiKey=${apiKey}`
        )
          .then((res) => res.json())

          .then((result) => {
            result.AIData = responseData;
            res.json(result);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).json({ error: error.message });
          });
      } else {
        res.json(responseData);
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    });
};

export default findRecipes;
