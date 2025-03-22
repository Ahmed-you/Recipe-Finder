import express from "express";
const router = express.Router();
import findRecipes from "../controllers/index.js";

router.get("/findRecipes/", findRecipes);

export default router;
