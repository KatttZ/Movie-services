import { Router } from "express";
import * as ratingsController from '../controllers/ratings';

const ratingRouter = Router();

ratingRouter.get("/:movieId", ratingsController.getRatingsByMovieId);

export default ratingRouter;
