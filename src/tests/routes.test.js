import supertest from "supertest";

import app from "../app.js";

test("the rout /findByIngredients should return an object", async () => {
  const res = await supertest(app)
    .post("/findByIngredients")
    .send({ ings: ["potato", "mango"] })
    .expect(200);
  expect(res.body).toBeInstanceOf(Object);

  expect(res.body.length).toBeGreaterThan(0);
});