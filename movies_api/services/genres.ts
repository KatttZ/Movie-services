"use strict";

import { Request, Response } from "express";
import { moviesDB } from "../db/movies";

export const getGenreList = (req: Request, res: Response): void => {
  const query = "SELECT * FROM movies;";

  moviesDB.all(query, [], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return; // Ensure to return after sending a response
    }

    if (rows.length === 0) {
      res.status(404).send("No movies found"); // Send a response for 404
      return; // Ensure to return after sending a response
    }

    const genreList: any[] = [];

    for (const row of rows) {
      const genres = JSON.parse(row.genres);
      for (const genre of genres) {
        if (!genreList.find((listItem) => listItem.name === genre.name)) {
          genreList.push(genre);
        }
      }
    }

    res.send(genreList);
  });
};
