import { Router } from "express";
import * as moviesController from '../controllers/movies';

const movieRouter = Router();

movieRouter.get("/all", moviesController.getAllMovies);
movieRouter.get("/:movieId", moviesController.getMovieById);
movieRouter.get("/year/:year", moviesController.getMoviesByYear);
movieRouter.get("/genre/:genre", moviesController.getMoviesByGenre);

export default movieRouter;
