import supertest from "supertest";

import app from "../app.js";

test("the rout /findRecipe should return an object in any case", async () => {
  const res = await supertest(app)
    .get("/findRecipes")
    .query({ textInput: "" })
    .expect(200)
    .expect("Content-Type", /json/);
  expect(res.body).toBeInstanceOf(Object);
  expect(Object.keys(res.body).length).toBeGreaterThan(0);
});

test(`typing hello or any form of greeting in /findRecipe the ai should return a msg that contain a sentence the 
  suggests  finding recipes`, async () => {
  const res = await supertest(app)
    .get("/findRecipes")
    .query({ textInput: "hello" })
    .expect(200)
    .expect("Content-Type", /json/);
  expect(res.body).toBeInstanceOf(Object);

  const message = res.body.msg;

  expect(
    message.includes("recipes") ||
      message.includes("cooking") ||
      message.includes("recipe") ||
      message.includes("help")
  ).toBe(true);
});

test(`if the user asked the Ai assistant in /findRecipe to search for a certain dish
   its msg must contain the word "searching" in it 
   and the "search_mode" must be (recipe_name)
   and the "ready" status must be (true)`, async () => {
  const res = await supertest(app)
    .get("/findRecipes")
    .query({ textInput: "i want to make some pizza" })
    .expect(200)
    .expect("Content-Type", /json/);
  expect(res.body).toBeInstanceOf(Object);

  const AIData = res.body.AIData;
  expect(
    AIData.msg.includes("Searching") && AIData.msg.includes("recipes")
  ).toBe(true);
  expect(AIData.search_mode).toBe("recipe_name");
  expect(AIData.ready).toBe(true);
});

test(`if the user asked the Ai assistant in /findRecipe to search for recipes using a selection of ingredients 
 its msg must contain the word "searching" and "ingredients" in it`, async () => {
  const res = await supertest(app)
    .get("/findRecipes")
    .query({
      textInput: `I got potatoes, chess And i got in my counter some onions, parsley and garlic hmmm what else.. 
        Oh  I have pasta and cheese search for me what i can do with these`,
    })
    .expect(200)
    .expect("Content-Type", /json/);
  expect(res.body).toBeInstanceOf(Object);

  const AIData = res.body.AIData;
  expect(
    AIData.msg.includes("Searching") && AIData.msg.includes("ingredients")
  ).toBe(true);
  expect(AIData.search_mode).toBe("ingredients");
  expect(AIData.ready).toBe(true);
});

test("should return 404 for invalid route", async () => {
  const res = await supertest(app)
    .get("/invalidRoute")
    .expect(404) // Expecting a 400 Bad Request status
    .expect("Content-Type", /json/);

  expect(res.body).toBeInstanceOf(Object);
  expect(res.body).toHaveProperty("error"); // Check that the error message is returned
});
