"use strict";

import { Request, Response } from "express";
import { ratingsDB } from "../db/ratings";

export const getRating = (req: Request, res: Response): void => {
  const query = "SELECT * FROM ratings WHERE movieId = ?";

  ratingsDB.all(query, [31], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return; // Ensure to return after sending a response
    }

    if (rows.length === 0) {
      res.status(404).send("No ratings found"); // Send a response for 404
      return; // Ensure to return after sending a response
    }

    res.send(rows);
  });
};
