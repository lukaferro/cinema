import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Film, Screening, Seat, BookingSummary } from '../../models';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieDetailsComponent implements OnInit {
  @ViewChild('seatSelectorRef') seatSelectorRef!: ElementRef;

  movie: Film | null = null;
  movieId!: number;
  loading = true;
  error: string | null = null;

  selectedDate: string = this.getMinDate();
  showings: Screening[] = [];
  showingsLoading = false;
  selectedShowing: Screening | null = null;

  seats: Seat[] = [];
  selectedSeats: string[] = [];
  seatRows: string[] = [];
  seatsPerRow = 20;
  showSeatSelector = false;
  bookingLoading = false;

  seatsByRow: Map<string, Seat[]> = new Map();

  bookingSummary: BookingSummary | null = null;
  showBookingSummary = false;

  firstName = '';
  lastName = '';
  email = '';
  formSubmitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.movieId = Number(params['id']);
      this.loadMovieDetails();
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMinDate(): string {
    return this.formatDate(new Date());
  }

  getMaxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return this.formatDate(maxDate);
  }

  loadMovieDetails(): void {
    this.movieService.getMovieById(this.movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loading = false;
        this.cdr.markForCheck();
        this.loadShowings();
      },
      error: (err) => {
        console.error('Errore nel caricamento del film:', err);
        this.error = 'Errore nel caricamento del film';
        this.loading = false;
        this.cdr.markForCheck();
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
        this.showings = data.filter(showing => {
          const date = new Date(showing.starts_at);
          const localDateString = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
          return localDateString === this.selectedDate;
        });
        this.showings.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
        this.showingsLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel caricamento degli orari:', err);
        this.showings = [];
        this.showingsLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectShowing(showing: Screening): void {
    this.selectedShowing = showing;
    this.selectedSeats = [];
    this.generateSeats(showing);
    this.showSeatSelector = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.seatSelectorRef?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  generateSeats(showing: Screening): void {
    const capacity = 260;
    const available = Math.min(showing.available_seats, capacity);
    const occupied = capacity - available;

    this.seatsPerRow = 20;
    const numRows = 13;

    this.seatRows = Array.from({ length: numRows }, (_, i) => String.fromCharCode(65 + i));

    const seatAvailability = Array(capacity).fill(true);
    let occupiedCount = 0;
    while (occupiedCount < occupied) {
      const randomIndex = Math.floor(Math.random() * capacity);
      if (seatAvailability[randomIndex]) {
        seatAvailability[randomIndex] = false;
        occupiedCount++;
      }
    }

    this.seats = [];
    this.seatsByRow = new Map();
    let seatCount = 0;

    for (const row of this.seatRows) {
      const rowSeats: Seat[] = [];
      for (let i = 1; i <= this.seatsPerRow; i++) {
        const seat: Seat = {
          id: `${row}${i}`,
          row: row,
          number: i,
          available: seatAvailability[seatCount],
          selected: false
        };
        this.seats.push(seat);
        rowSeats.push(seat);
        seatCount++;
      }
      this.seatsByRow.set(row, rowSeats);
    }
  }

  getSeatsForRow(rowLetter: string): Seat[] {
    return this.seatsByRow.get(rowLetter) ?? [];
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
    this.cdr.markForCheck();
  }

  onSeatKeydown(event: KeyboardEvent, seat: Seat): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleSeat(seat);
    }
  }

  onShowingKeydown(event: KeyboardEvent, showing: Screening): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectShowing(showing);
    }
  }

  bookSeats(): void {
    if (this.selectedSeats.length === 0) return;

    this.formSubmitted = false;

    setTimeout(() => {
      this.formSubmitted = true;
      this.cdr.markForCheck();

      if (!this.firstName || !this.lastName || !this.email) return;

      this.bookingLoading = true;
      const bookingData = {
        first_name: this.firstName,
        last_name: this.lastName,
        email: this.email
      };

      const formattedTime = new Date(this.selectedShowing!.starts_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

      this.movieService.bookSeats(this.selectedShowing!.id, bookingData).subscribe({
        next: (response) => {
          this.bookingSummary = {
            confirmed: true,
            movie: this.movie!.title,
            date: this.selectedDate,
            time: formattedTime,
            seats: this.selectedSeats,
            totalPrice: this.selectedSeats.length * 10,
            confirmationCode: String(response.id) || 'BK' + Date.now()
          };
          this.showBookingSummary = true;
          this.showSeatSelector = false;
          this.bookingLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Errore nella prenotazione:', err);
          let errorMessage = 'Errore nella prenotazione. Riprova più tardi.';
          if (err && err.error) {
            errorMessage = err.error;
            if (err.details && err.details.email) {
              errorMessage += ': ' + err.details.email;
            }
          }
          this.bookingSummary = {
            confirmed: false,
            movie: this.movie!.title,
            date: this.selectedDate,
            time: formattedTime,
            seats: this.selectedSeats,
            totalPrice: this.selectedSeats.length * 10,
            error: errorMessage
          };
          this.showBookingSummary = true;
          this.bookingLoading = false;
          this.cdr.markForCheck();
        }
      });
    }, 10);
  }

  cancelSelection(): void {
    this.showSeatSelector = false;
    this.selectedShowing = null;
    this.selectedSeats = [];
    this.formSubmitted = false;
    this.cdr.markForCheck();
  }

  goBack(): void {
    this.router.navigate(['/movies']);
  }

  newBooking(): void {
    this.showBookingSummary = false;
    this.selectedSeats = [];
    this.selectedShowing = null;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.formSubmitted = false;
    this.cdr.markForCheck();
  }
}
