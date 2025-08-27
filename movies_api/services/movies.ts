"use strict";

import { Request, Response } from "express";
import { Movie, Rating } from "../types/movies";
import { ratingsDB } from "../db/ratings";
import { moviesDB } from "../db/movies";
import { formatBudget } from "../util/format";
import { onError, onSuccess, PaginatedResponse } from "../types/util";
import axios from "axios";


// List All movies
export const getAllMovies = (
  query: Request["query"],
  onSuccess: onSuccess<PaginatedResponse<any>>,
  onError: onError
): void => {
  const page = Number(query.page) || 1;
  const order = query.order === "desc" ? "DESC" : "ASC";

  // Note: we could store the limit in an environment instead;
  const limit = 50;
  const offset = (+page - 1) * limit;

  // First get the total count
  const countQuery = `SELECT COUNT(*) as total FROM movies`;

  moviesDB.get(countQuery, [], (err: Error | null, countRow: any) => {
    if (err) {
      onError(500, err.message);
      return;
    }

    const count = countRow.total;
    const totalPages = Math.ceil(count / limit);

    const query = `
      SELECT imdbId, title, genres, releaseDate, budget
      FROM movies
      ORDER BY releaseDate ${order}
      LIMIT ? OFFSET ?
    `;

    moviesDB.all(query, [limit, offset], (err: Error | null, rows: any[]) => {
      if (err) {
        onError(500, err.message);
        return;
      }

      console.log(rows[0]);

      const movies = rows.map((row) => ({
        imdbId: row.imdbId,
        title: row.title,
        genres: JSON.parse(row.genres),
        releaseDate: row.releaseDate,
        budget: formatBudget(row.budget),
      }));
      onSuccess({
        data: movies,
        totalPages,
        currPage: page,
        count,
        limit,
      })
    });
  });
};

//GET Movie Details (single movie - keeps original format)
export const getMovie = (
  id: string,
  onSuccess: onSuccess<any>,
  onError: onError
): void => {
  const query = `SELECT * FROM movies WHERE movieId = ?`;

  moviesDB.get(query, [id], (err: Error | null, row: any) => {
    if (err) {
      onError(500, err.message);
      return;
    }

    if (!row) {
      onError(404, "Movie not found");
      return;
    }

    const movie: Movie = {
      imdbId: row.imdbId,
      title: row.title,
      description: row.description,
      genres: JSON.parse(row.genres),
      releaseDate: row.releaseDate,
      budget: formatBudget(row.budget),
      runtime: row.runtime,
      language: row.language,
      productionCompanies: JSON.parse(row.productionCompanies),
      ratings: [],
    };

    ratingsDB.get(
      "SELECT rating FROM ratings WHERE movieId = ?",
      [id],
      (err, ratingRow: { rating: number } | undefined) => {
        if (err) {
          onError(500, err.message);
          return;
        }

        const ratings: Rating[] = [];

        if (ratingRow) {
          ratings.push({
            source: "Local",
            value: ratingRow.rating
          });
        }
        getRottenTomatoRating(movie.imdbId).then((rating) => {
          // for testing purpose:
          // if movie id 5 has rotten tomato rating
          if (rating) {
            ratings.push(rating);
          }
        }).finally(() => {
          movie.ratings = ratings;
          onSuccess(movie);
        });
      }
    );
  });
};

// Movies By Year
export const getMoviesByYear = (
  year: string,
  query: Request["query"],
  onSuccess: onSuccess<PaginatedResponse<any>>,
  onError: onError
): void => {
  const page = Number(query.page) || 1;
  const order = query.order === "desc" ? "DESC" : "ASC";
  const limit = 50;
  const offset = (+page - 1) * limit;

  // Get total count for the year
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM movies 
    WHERE strftime('%Y', releaseDate) = ?
  `;

  moviesDB.get(countQuery, [year.toString()], (err: Error | null, countRow: any) => {
    if (err) {
      onError(500, err.message);
      return;
    }

    const count = countRow.total;
    const totalPages = Math.ceil(count / limit);

    const query = `
      SELECT imdbId, title, genres, releaseDate, budget
      FROM movies
      WHERE strftime('%Y',releaseDate) = ?
      ORDER BY releaseDate ${order}
      LIMIT ? OFFSET ?;
    `;

    moviesDB.all(query, [year.toString(), limit, offset], (err: Error | null, rows: any[]) => {
      if (err) {
        onError(500, err.message);
        return;
      }

      const movies = rows.map((row) => ({
        imdbId: row.imdbId,
        title: row.title,
        genres: JSON.parse(row.genres),
        releaseDate: row.releaseDate,
        budget: formatBudget(row.budget),
      }));

      onSuccess({
        data: movies,
        totalPages,
        currPage: page,
        count,
        limit,
      });
    });
  });
};

//Movies By Genre
export const getMoviesByGenre = (
  genre: string,
  query: Request["query"],
  onSuccess: onSuccess<PaginatedResponse<any>>,
  onError: onError
): void => {
  const page = Number(query.page) || 1;
  const order = query.order === "desc" ? "DESC" : "ASC";
  const limit = 50;
  const offset = (+page - 1) * limit;

  // For genre, we need to count matches first (this is a bit more complex due to JSON filtering)
  const countQuery = `
    SELECT imdbId, genres
    FROM movies
    WHERE genres IS NOT NULL AND genres LIKE ?
  `;

  const genrePattern = `%"name": "${genre}"%`;

  moviesDB.all(countQuery, [genrePattern], (err: Error | null, countRows: any[]) => {
    if (err) {
      onError(500, err.message);
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

    // Now get the actual paginated data
    const query = `
      SELECT imdbId, title, genres, releaseDate, budget
      FROM movies
      WHERE genres IS NOT NULL AND genres LIKE ?
      ORDER BY releaseDate ${order}
      LIMIT ? OFFSET ?;
    `;

    moviesDB.all(query, [genrePattern, limit, offset], (err: Error | null, rows: any[]) => {
      if (err) {
        onError(500, err.message);
        return;
      }

      // Filter the results to ensure accuracy
      const filteredRows = rows.filter((row) => {
        try {
          const genresArray = JSON.parse(row.genres);
          return genresArray.some(
            (g: any) => g.name && g.name.toLowerCase() === genre.toLowerCase()
          );
        } catch (e) {
          return false;
        }
      });

      const movies = filteredRows.map((row) => ({
        imdbId: row.imdbId,
        title: row.title,
        genres: JSON.parse(row.genres),
        releaseDate: row.releaseDate,
        budget: formatBudget(row.budget),
      }));

      onSuccess({
        data: movies,
        totalPages,
        currPage: page,
        count,
        limit,
      });
    });
  });
};


export const getRottenTomatoRating = async (imdbId: string): Promise<Rating | null> => {
  try {
    const { data } = await axios.get(`http://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}`)
    const tomatoRating = data.Ratings.find((rating: { Source: string, Value: string }) => rating.Source === "Rotten Tomatoes")
    if (tomatoRating) {
      return {
        source: "Rotten Tomatoes",
        value: tomatoRating.Value
      }
    }
    return null;
  } catch (err: any) {
    console.log(err.message)
    return null;
  }
}