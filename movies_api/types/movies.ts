export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
}

export interface Rating {
  source: string;
  value: number | string;
}

export interface Movie {
  imdbId: string;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: string;
  budget: string;
  runtime: number;
  language: string;
  productionCompanies: ProductionCompany[];
  ratings: Rating[]
}

export type MoviePreview = Pick<Movie, 'imdbId' | 'title' | 'genres' | 'releaseDate' | 'budget'>;