import app from "./app.js";
const port = process.env.PORT || 4001;
// imported the main router


app.listen(port, () => {
  console.log(`server is up and running on port: http://localhost:${port}/`);
});
