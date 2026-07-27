export interface Film {
  id: number;
  title: string;
  genre: string;
  duration: number;
  director: string;
  description: string;
  poster_url: string;
  year: number;
  rating: string;
  tagline?: string;
  backdrop_path?: string;
  vote_count?: number;
}

export interface TmdbMovieResponse {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  tagline?: string;
  credits?: {
    crew: { job: string; name: string }[];
  };
}

export interface TmdbListResponse {
  page: number;
  results: TmdbMovieResponse[];
  total_pages: number;
  total_results: number;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbGenreListResponse {
  genres: TmdbGenre[];
}
