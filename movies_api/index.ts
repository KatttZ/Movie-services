'use strict';

import express, { Request, Response } from 'express';
import moviesRouter from './routes/movies';
import ratingsRouter from './routes/ratings';
import genresRouter from './routes/genres';
import dotenv from 'dotenv';

dotenv.config();

// A simple implementation has been made
// design pattern: layered architecture: controller, service, 

// potential improvements:
// 1. use async/await syntax. but sqlite3 seems to only provide queries with callback functions
// 2. add error handling middleware to avoid redundant logic
// 3. implement an ORM library to simplify sql queries, and use a library such as Zod or Yup to ensure proper types and validation
// 4. add an additional repository layer for larger applications


const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the movie API!');
});
app.get('/heartbeat', (req: Request, res: Response) => {
  res.send('Have fun with the project!');
});

app.use("/movies", moviesRouter);
app.use("/ratings", ratingsRouter);
app.use("/genres", genresRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});