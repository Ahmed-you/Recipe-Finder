import express from "express";
const router = express.Router();
import findByIngredients from "./findByIngredients.js";

router.use("/findByIngredients", findByIngredients)

router.get("/", (req, res) => {
  res.send("hello from the main router");
});
export default router;
