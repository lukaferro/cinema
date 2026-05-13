import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Film, Screening, BookingRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly API_BASE_URL = 'http://localhost:8080/api';

  constructor() {}

  /**
   * Recupera tutti i film con filtro facoltativo per genere
   */
  getMovies(genre?: string): Observable<Film[]> {
    const url = genre 
      ? `${this.API_BASE_URL}/films?genre=${genre}`
      : `${this.API_BASE_URL}/films`;
    
    return from(
      fetch(url)
        .then(res => res.json())
        .catch(err => {
          console.error('Fetch error:', err);
          throw err;
        })
    );
  }

  /**
   * Recupera i dettagli di un film specifico
   */
  getMovieById(id: number): Observable<Film> {
    return from(
      fetch(`${this.API_BASE_URL}/films/${id}`)
        .then(res => res.json())
        .catch(err => {
          console.error('Fetch error:', err);
          throw err;
        })
    );
  }

  /**
   * Recupera gli screening (orari) di un film
   */
  getScreenings(filmId: number): Observable<Screening[]> {
    return from(
      fetch(`${this.API_BASE_URL}/films/${filmId}/screenings`)
        .then(res => res.json())
        .catch(err => {
          console.error('Fetch error:', err);
          throw err;
        })
    );
  }

  /**
   * Prenota i posti
   */
  bookSeats(screeningId: number, bookingData: BookingRequest): Observable<any> {
    return from(
      fetch(`${this.API_BASE_URL}/screenings/${screeningId}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })
        .then(async res => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw data;
          }
          return data;
        })
        .catch(err => {
          console.error('Fetch error:', err);
          throw err;
        })
    );
  }
}