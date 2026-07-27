import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Film,
  Screening,
  BookingRequest,
  TmdbMovieResponse,
  TmdbListResponse,
  TmdbGenre,
  TmdbGenreListResponse
} from '../models';


@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private genreCache: Map<number, string> = new Map();

  constructor(private http: HttpClient) {}

  private get<T>(endpoint: string, params?: Record<string, string>): Observable<T> {
    const httpParams = new HttpParams({ fromObject: params ?? {} });
    return this.http.get<T>(`${environment.tmdbBaseUrl}${endpoint}`, {
      params: httpParams,
      headers: { Authorization: `Bearer ${environment.tmdbApiKey}` }
    });
  }

  private mapTmdbToFilm(tmdb: TmdbMovieResponse): Film {
    let genre = '';
    if (tmdb.genres && tmdb.genres.length > 0) {
      genre = tmdb.genres[0].name;
    } else if (tmdb.genre_ids && tmdb.genre_ids.length > 0) {
      genre = this.genreCache.get(tmdb.genre_ids[0]) ?? '';
    }

    let director = '';
    if (tmdb.credits?.crew) {
      const dir = tmdb.credits.crew.find(c => c.job === 'Director');
      if (dir) director = dir.name;
    }

    const year = tmdb.release_date
      ? parseInt(tmdb.release_date.substring(0, 4), 10)
      : 0;

    return {
      id: tmdb.id,
      title: tmdb.title,
      genre,
      duration: tmdb.runtime ?? 0,
      director,
      description: tmdb.overview,
      poster_url: tmdb.poster_path
        ? `${environment.tmdbImageBaseUrl}${tmdb.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster',
      year,
      rating: tmdb.vote_average.toFixed(1),
      tagline: tmdb.tagline,
      backdrop_path: tmdb.backdrop_path
        ? `${environment.tmdbImageBaseUrl}${tmdb.backdrop_path}`
        : undefined,
      vote_count: tmdb.vote_count
    };
  }

  loadGenres(): Observable<void> {
    if (this.genreCache.size > 0) {
      return of(undefined);
    }
    return this.get<TmdbGenreListResponse>('/genre/movie/list', { language: 'it-IT' }).pipe(
      map(res => {
        res.genres.forEach(g => this.genreCache.set(g.id, g.name));
      })
    );
  }

  getPopularMovies(): Observable<Film[]> {
    return this.loadGenres().pipe(
      switchMap(() =>
        this.get<TmdbListResponse>('/movie/popular', { language: 'it-IT', page: '1' })
      ),
      map(res => res.results.map(m => this.mapTmdbToFilm(m)))
    );
  }

  getNowPlayingMovies(): Observable<Film[]> {
    return this.loadGenres().pipe(
      switchMap(() =>
        this.get<TmdbListResponse>('/movie/now_playing', { language: 'it-IT', page: '1' })
      ),
      map(res => res.results.map(m => this.mapTmdbToFilm(m)))
    );
  }

  getTopRatedMovies(): Observable<Film[]> {
    return this.loadGenres().pipe(
      switchMap(() =>
        this.get<TmdbListResponse>('/movie/top_rated', { language: 'it-IT', page: '1' })
      ),
      map(res => res.results.map(m => this.mapTmdbToFilm(m)))
    );
  }

  searchMovies(query: string): Observable<Film[]> {
    return this.loadGenres().pipe(
      switchMap(() =>
        this.get<TmdbListResponse>('/search/movie', {
          query,
          language: 'it-IT',
          page: '1',
          include_adult: 'false'
        })
      ),
      map(res => res.results.map(m => this.mapTmdbToFilm(m)))
    );
  }

  getMoviesByGenre(genreId: number): Observable<Film[]> {
    return this.loadGenres().pipe(
      switchMap(() =>
        this.get<TmdbListResponse>('/discover/movie', {
          with_genres: String(genreId),
          language: 'it-IT',
          page: '1',
          sort_by: 'popularity.desc'
        })
      ),
      map(res => res.results.map(m => this.mapTmdbToFilm(m)))
    );
  }

  getAllGenres(): Observable<TmdbGenre[]> {
    return this.get<TmdbGenreListResponse>('/genre/movie/list', { language: 'it-IT' }).pipe(
      map(res => res.genres)
    );
  }

  getMovieById(id: number): Observable<Film | undefined> {
    return this.loadGenres().pipe(
      switchMap(() =>
        this.get<TmdbMovieResponse>(`/movie/${id}`, {
          language: 'it-IT',
          append_to_response: 'credits'
        })
      ),
      map(res => this.mapTmdbToFilm(res))
    );
  }

  getScreenings(filmId: number): Observable<Screening[]> {
    const halls = [
      { id: 1, name: 'Sala 1 - IMAX', capacity: 200 },
      { id: 2, name: 'Sala 2', capacity: 120 },
      { id: 3, name: 'Sala 3', capacity: 150 },
      { id: 4, name: 'Sala 4', capacity: 80 }
    ];
    const times = ['14:00', '16:30', '19:00', '21:30'];
    const today = new Date();
    const screenings: Screening[] = times.map((time, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + Math.floor(i / 2));
      const [h, m] = time.split(':');
      date.setHours(Number(h), Number(m), 0, 0);
      const hall = halls[i % halls.length];
      const seed = (filmId * 31 + i * 17) % hall.capacity;
      const available = Math.max(10, hall.capacity - seed);
      return {
        id: i + 1,
        starts_at: date.toISOString(),
        film: { id: filmId } as Film,
        hall,
        available_seats: available
      };
    });
    return of(screenings);
  }

  bookSeats(screeningId: number, bookingData: BookingRequest): Observable<unknown> {
    return of({
      success: true,
      message: 'Prenotazione confermata!',
      bookingId: Math.floor(Math.random() * 10000),
      screeningId,
      firstName: bookingData.first_name,
      lastName: bookingData.last_name,
      email: bookingData.email
    });
  }
}
