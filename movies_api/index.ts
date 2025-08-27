"use strict";

import express, { Request, Response } from "express";
import movieRouter from "./routes/movies";
import ratingRouter from "./routes/ratings";
import genreRouter from "./routes/genres";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the movie API!");
});
app.get("/heartbeat", (req: Request, res: Response) => {
  res.send("Have fun with the project!");
});

app.use("/movies", movieRouter);
app.use("/ratings", ratingRouter);
app.use("/genres", genreRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
