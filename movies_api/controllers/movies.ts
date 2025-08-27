import { Request, Response } from "express"

import * as moviesService from '../services/movies';

export const getAllMovies = (req: Request, res: Response) => {
    moviesService.getAllMovies(
        req.query,
        (data) => res.json(data),
        (status: number, errMsg: string) => res.status(status).json({ error: errMsg })
    )
}

export const getMovieById = (req: Request, res: Response) => {
    const { movieId } = req.params!;
    moviesService.getMovie(
        movieId,
        (data) => res.json(data),
        (status: number, errMsg: string) => res.status(status).json({ error: errMsg })
    )
}

export const getMoviesByYear = (req: Request, res: Response) => {
    const { year } = req.params!;
    moviesService.getMoviesByYear(
        year,
        req.query,
        (data) => res.json(data),
        (status: number, errMsg: string) => res.status(status).json({ error: errMsg })
    )
}

export const getMoviesByGenre = (req: Request, res: Response) => {
    const { genre } = req.params!;
    moviesService.getMoviesByGenre(
        genre,
        req.query,
        (data) => res.json(data),
        (status: number, errMsg: string) => res.status(status).json({ error: errMsg })
    )
}
