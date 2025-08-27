import { Router } from "express";
import * as genresController from "../controllers/genres";

const genreRouter = Router();

genreRouter.get("/all", genresController.getAllGenres);

export default genreRouter;