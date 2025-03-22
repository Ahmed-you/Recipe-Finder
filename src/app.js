import express from "express";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import router from "./router/index.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/", router);
//handel not found pages
app.use((req, res, next) => {
  res.status(404).json({ error: "Page Not Found 404" });
});
//handel server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.disable("x-powered-by");

const __dirname = dirname(fileURLToPath(import.meta.url));
// app.use(favicon(path.join(__dirname, "../public", "favicon.ico")));

export default app;
