import { Router } from "express";
import * as movies from "../services/movies";

const movieRouter = Router();

movieRouter.get("/all", movies.getAllMovies);
movieRouter.get("/:movieId", movies.getMovie);
movieRouter.get("/year/:year", movies.getMoviesByYear);
movieRouter.get("/genre/:genre", movies.getMoviesByGenre);

export default movieRouter;
