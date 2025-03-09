import app from "./app.js";
const port = process.env.PORT || 4000;
// imported the main router

//handel not found pages
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

//handel server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

app.listen(port, () => {
  console.log(`server is up and running on port: http://localhost:${port}/`);
});
