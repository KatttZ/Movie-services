'use strict';

import { moviesDB } from '../db/movies';
import { Genre } from '../types/movies';
import { onError, onSuccess } from '../types/util';


export const getGenreList = async (onSuccess: onSuccess<Genre[]>, onError: onError) => {
  const query = 'SELECT * FROM movies;';

  moviesDB.all(query, [], (err: Error | null, rows: any[]) => {
    if (err) {
      onError(500, err.message);
      return; // Ensure to return after sending a response
    }

    const genreNamesSet = new Set<string>();
    const genreList: Genre[] = [];
    for (const row of rows) {
      const genres = JSON.parse(row.genres);
      for (const genre of genres) {
        // using a set to track unique genre names, avoid nested loops
        if (!genreNamesSet.has(genre.name)) {
          genreNamesSet.add(genre.name);
          genreList.push(genre);
        }
      }
    }
    if (genreList.length === 0) {
      onError(404, 'No movies found');
    }

    onSuccess(genreList);
  });
};
