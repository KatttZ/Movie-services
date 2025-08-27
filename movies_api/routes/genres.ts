import { Router } from "express";
import * as genres from "../services/genres";

const genreRouter = Router();

genreRouter.get("/all", (req, res) => {
  genres.getGenreList(req, res);
});

export default genreRouter;
