import { Request, Response } from "express";

import * as ratingsService from '../services/ratings';

export const getRatingsByMovieId = (req: Request, res: Response) => {
    const { movieId } = req.params;
    ratingsService.getRating(
        Number(movieId),
        (rating) => { res.send(rating) },
        (status: number, errMsg: string) => {
            res.status(status).send({
                message: errMsg
            });
        }
    );
}