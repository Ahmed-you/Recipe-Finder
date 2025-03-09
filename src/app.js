import express from "express";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import router from "./controllers/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/", router);

app.disable("x-powered-by");

const __dirname = dirname(fileURLToPath(import.meta.url));
// app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));

export default app;
