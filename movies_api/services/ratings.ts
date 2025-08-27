'use strict';

import { Request, Response } from 'express';
import { ratingsDB } from '../db/ratings';
import { onError, onSuccess } from '../types/util';

export const getRating = (movieId: number, onSuccess: onSuccess<any>, onError: onError) => {
  const query = 'SELECT * FROM ratings WHERE movieId = ?';

  ratingsDB.all(query, [movieId], (err: Error | null, rows: any[]) => {
    if (err) {
      onError(500, err.message);
      return;
    }

    if (rows.length === 0) {
      onError(404, 'No ratings found');
      return;
    }

    onSuccess(rows);
  });
};