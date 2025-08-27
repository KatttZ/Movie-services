"use strict";

import { Request, Response } from "express";
import { Movie } from "../types/movies";
import { ratingsDB } from "../db/ratings";
import { moviesDB } from "../db/movies";
import { formatBudget } from "../util/format";

// List All movies
export const getAllMovies = (req: Request, res: Response): void => {
  const { page = "1" } = req.query || {};

  // Note: we could store the limit in an environment instead;
  const limit = 50;
  const offset = (+page - 1) * limit;

  // Get the total count
  const countQuery = `SELECT COUNT(*) as total FROM movies`;

  moviesDB.get(countQuery, [], (err: Error | null, countRow: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const count = countRow.total;
    const totalPages = Math.ceil(count / limit);

    const query = `
      SELECT imdbid, title, genres, releaseDate, budget
      FROM movies
      LIMIT ? OFFSET ?
    `;

    moviesDB.all(query, [limit, offset], (err: Error | null, rows: any[]) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (!rows || rows.length === 0) {
        res.status(404).json({ message: "No movies found" });
        return;
      }

      const movies = rows.map((row) => ({
        imdbid: row.imdbid,
        title: row.title,
        genres: JSON.parse(row.genres),
        releaseDate: row.releaseDate,
        budget: formatBudget(row.budget),
      }));

      res.json({
        movies,
        totalPages,
        currPage: page,
        count,
        limit,
      });
    });
  });
};

//GET Movie Details 
export const getMovie = (req: Request, res: Response): void => {
  const query = `SELECT * FROM movies WHERE movieId = ?`;

  const { movieId } = req.params!;

  moviesDB.get(query, [movieId], (err: Error | null, row: any) => {
    if (err) {
      res.status(500).send(JSON.stringify(err));
      return;
    }

    if (!row) {
      res.status(404).send("Movie not found");
      return;
    }

    const movie: Movie = {
      imdbid: row.imdbid,
      title: row.title,
      description: row.description,
      genres: JSON.parse(row.genres),
      releaseDate: row.releaseDate,
      budget: formatBudget(row.budget),
      runtime: row.runtime,
      language: row.language,
      productionCompanies: JSON.parse(row.productionCompanies),
      ratings: null,
    };

    const movieId = Number(row.movieId);

    ratingsDB.get(
      "SELECT rating FROM ratings WHERE movieId = ?",
      [movieId],
      (err, ratingRow: { rating: number } | undefined) => {
        if (err) {
          res.status(500).send(JSON.stringify(err));
          return;
        }

        if (ratingRow) {
          movie.ratings = ratingRow.rating;
        }

        res.json(movie);
      }
    );
  });
};

// Movies By Year
export const getMoviesByYear = (req: Request, res: Response): void => {
  const { year } = req.params;

  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const order = req.query.order === "desc" ? "DESC" : "ASC";

  // Get total count for the year
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM movies 
    WHERE strftime('%Y', releaseDate) = ?
  `;

  moviesDB.get(
    countQuery,
    [year.toString()],
    (err: Error | null, countRow: any) => {
      if (err) {
        res.status(500).send(JSON.stringify(err));
        return;
      }

      const count = countRow.total;
      const totalPages = Math.ceil(count / limit);

      const query = `
      SELECT imdbid, title, genres, releaseDate, budget
      FROM movies
      WHERE strftime('%Y',releaseDate) = ?
      ORDER BY releaseDate ${order}
      LIMIT ? OFFSET ?;
    `;

      moviesDB.all(
        query,
        [year.toString(), limit, offset],
        (err: Error | null, rows: any[]) => {
          if (err) {
            res.status(500).send(JSON.stringify(err));
            return;
          }

          if (rows.length === 0) {
            res.status(404).send("No movies found for this year");
            return;
          }

          const movies = rows.map((row) => ({
            imdbid: row.imdbid,
            title: row.title,
            genres: JSON.parse(row.genres),
            releaseDate: row.releaseDate,
            budget: formatBudget(row.budget),
          }));

          res.json({
            movies,
            totalPages,
            currPage: page,
            count,
            limit,
          });
        }
      );
    }
  );
};

//Movies By Genre
export const getMoviesByGenre = (req: Request, res: Response): void => {
  const { genre } = req.params;

  const page = parseInt(req.query.page as string) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;
  const order = req.query.order === "desc" ? "DESC" : "ASC";

  // Count matches first
  const countQuery = `
    SELECT imdbid, genres
    FROM movies
    WHERE genres IS NOT NULL AND genres LIKE ?
  `;

  const genrePattern = `%"name": "${genre}"%`;

  moviesDB.all(
    countQuery,
    [genrePattern],
    (err: Error | null, countRows: any[]) => {
      if (err) {
        res.status(500).send(JSON.stringify(err));
        return;
      }

      // Filter to get accurate count
      const matchingRows = countRows.filter((row) => {
        try {
          const genresArray = JSON.parse(row.genres);
          return genresArray.some(
            (g: any) => g.name && g.name.toLowerCase() === genre.toLowerCase()
          );
        } catch (e) {
          return false;
        }
      });

      const count = matchingRows.length;
      const totalPages = Math.ceil(count / limit);

      // Get the actual paginated data
      const query = `
      SELECT imdbid, title, genres, releaseDate, budget
      FROM movies
      WHERE genres IS NOT NULL AND genres LIKE ?
      ORDER BY releaseDate ${order}
      LIMIT ? OFFSET ?;
    `;

      moviesDB.all(
        query,
        [genrePattern, limit, offset],
        (err: Error | null, rows: any[]) => {
          if (err) {
            res.status(500).send(JSON.stringify(err));
            return;
          }

          // Filter the results to ensure accuracy
          const filteredRows = rows.filter((row) => {
            try {
              const genresArray = JSON.parse(row.genres);
              return genresArray.some(
                (g: any) =>
                  g.name && g.name.toLowerCase() === genre.toLowerCase()
              );
            } catch (e) {
              return false;
            }
          });

          const movies = filteredRows.map((row) => ({
            imdbid: row.imdbid,
            title: row.title,
            genres: JSON.parse(row.genres),
            releaseDate: row.releaseDate,
            budget: formatBudget(row.budget),
          }));

          res.json({
            movies,
            totalPages,
            currPage: page,
            count,
            limit,
          });
        }
      );
    }
  );
};
