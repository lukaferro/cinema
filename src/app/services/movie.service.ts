import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Film, Screening, BookingRequest } from '../models';
import { MOCK_FILMS } from '../data/mock-films';
import { MOCK_SCREENINGS } from '../data/mock-screenings';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor() {}

  getMovies(genre?: string): Observable<Film[]> {
    if (genre) {
      const filtered = MOCK_FILMS.filter(f => f.genre.toLowerCase() === genre.toLowerCase());
      return of(filtered);
    }
    return of(MOCK_FILMS);
  }

  getMovieById(id: number): Observable<Film | undefined> {
    const film = MOCK_FILMS.find(f => f.id === id);
    return of(film);
  }

  getScreenings(filmId: number): Observable<Screening[]> {
    const screenings = MOCK_SCREENINGS.filter(s => s.film.id === filmId);
    return of(screenings);
  }

  bookSeats(screeningId: number, bookingData: BookingRequest): Observable<any> {
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
