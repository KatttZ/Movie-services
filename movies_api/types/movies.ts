export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface Movie {
  imdbid: string;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: string;
  budget: string;
  runtime: number;
  language: string;
  productionCompanies: ProductionCompany[];
  ratings: number | null;
}

export type MoviePreview = Pick<Movie, 'imdbid' | 'title' | 'genres' | 'releaseDate' | 'budget'>;