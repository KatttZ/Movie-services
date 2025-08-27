import { Request, Response } from 'express';
import * as genresService from '../services/genres';
export const getAllGenres = (req: Request, res: Response) => {
    // controller only handles request and response
    // business logics are inside service layer
    genresService.getGenreList(
        (genreList) => {res.send(genreList)}
    , 
    (status: number, errMsg: string) => {
        res.status(status).send({
            error: errMsg
        });
    });
}