import { Router } from "express";
import * as ratings from "../services/ratings";

const ratingRouter = Router();

ratingRouter.get("/:movieId", ratings.getRating);

export default ratingRouter;
