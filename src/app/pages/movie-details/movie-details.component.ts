import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Film, Screening, Seat, BookingSummary } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css'
})
export class MovieDetailsComponent implements OnInit {
  movie: Film | null = null;
  movieId!: number;
  loading = true;
  error: string | null = null;

  // Selezione data e orario
  selectedDate: string = this.getMinDate();
  showings: Screening[] = [];
  showingsLoading = false;
  selectedShowing: Screening | null = null;

  // Selezione posti
  seats: Seat[] = [];
  selectedSeats: string[] = [];
  showSeatSelector = false;
  bookingLoading = false;

  // Dettagli prenotazione
  bookingSummary: BookingSummary | null = null;
  showBookingSummary = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.movieId = params['id'];
      this.loadMovieDetails();
    });
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  }

  loadMovieDetails(): void {
    // Carica i dettagli del film da API
    this.movieService.getMovieById(this.movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
        // Carica gli screening una volta che il film è caricato
        this.loadShowings();
      },
      error: (err) => {
        console.error('Errore nel caricamento del film:', err);
        this.error = 'Errore nel caricamento del film';
        this.loading = false;
      }
    });
  }

  onDateChange(): void {
    this.selectedShowing = null;
    this.selectedSeats = [];
    this.loadShowings();
  }

  loadShowings(): void {
    this.showingsLoading = true;
    this.movieService.getScreenings(this.movieId).subscribe({
      next: (data) => {
        this.showings = data;
        this.showingsLoading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento degli orari:', err);
        this.showings = [];
        this.showingsLoading = false;
      }
    });
  }

  selectShowing(showing: Screening): void {
    this.selectedShowing = showing;
    this.selectedSeats = [];
    this.generateSeats(showing.available_seats);
    this.showSeatSelector = true;
  }

  generateSeats(available: number): void {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const seatsPerRow = 10;
    this.seats = [];
    let seatCount = 0;

    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        seatCount++;
        this.seats.push({
          id: `${row}${i}`,
          row: row,
          number: i,
          available: seatCount <= available,
          selected: false
        });
      }
    }
  }

  getSeatsForRow(rowLetter: string): Seat[] {
    const rowIndex = rowLetter.charCodeAt(0) - 65;
    const start = rowIndex * 10;
    const end = start + 10;
    return this.seats.slice(start, end);
  }

  toggleSeat(seat: Seat): void {
    if (!seat.available) return;
    
    seat.selected = !seat.selected;
    
    if (seat.selected) {
      this.selectedSeats.push(seat.id);
    } else {
      const index = this.selectedSeats.indexOf(seat.id);
      if (index > -1) {
        this.selectedSeats.splice(index, 1);
      }
    }
  }

  bookSeats(): void {
    if (this.selectedSeats.length === 0) {
      alert('Per favore, seleziona almeno un posto');
      return;
    }

    this.bookingLoading = true;
    const bookingData = {
      screening_id: this.selectedShowing!.id,
      seats: this.selectedSeats
    };

    this.movieService.bookSeats(bookingData).subscribe({
      next: (response) => {
        this.bookingSummary = {
          confirmed: true,
          movie: this.movie!.title,
          date: this.selectedDate,
          time: this.selectedShowing!.time,
          seats: this.selectedSeats,
          totalPrice: this.selectedSeats.length * 10,
          confirmationCode: response.booking_id || 'BK' + Date.now()
        };
        this.showBookingSummary = true;
        this.showSeatSelector = false;
        this.bookingLoading = false;
      },
      error: (err) => {
        console.error('Errore nella prenotazione:', err);
        this.bookingSummary = {
          confirmed: false,
          movie: this.movie!.title,
          date: this.selectedDate,
          time: this.selectedShowing!.time,
          seats: this.selectedSeats,
          totalPrice: this.selectedSeats.length * 10,
          error: 'Errore nella prenotazione. Riprova più tardi.'
        };
        this.showBookingSummary = true;
        this.bookingLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }

  newBooking(): void {
    this.showBookingSummary = false;
    this.selectedSeats = [];
    this.selectedShowing = null;
  }
}