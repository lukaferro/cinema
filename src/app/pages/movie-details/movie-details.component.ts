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
  seatRows: string[] = [];
  seatsPerRow = 20;
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
        // Filtriamo gli orari in base alla data selezionata
        this.showings = data.filter(showing => {
          const date = new Date(showing.starts_at);
          const localDateString = date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0');
          return localDateString === this.selectedDate;
        });

        // Ordiniamo gli orari cronologicamente
        this.showings.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

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
    this.generateSeats(showing);
    this.showSeatSelector = true;

    // Scroll automatico fluido verso la selezione dei posti
    setTimeout(() => {
      const seatSelector = document.querySelector('.seat-selector');
      if (seatSelector) {
        seatSelector.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  generateSeats(showing: Screening): void {
    // Posti fissi a 260 per supportare sale più grandi (es. 250 posti)
    const capacity = 260;
    const available = Math.min(showing.available_seats, capacity);
    const occupied = capacity - available;

    this.seatsPerRow = 20;
    const numRows = 13; // 20 posti * 13 file = 260 posti fissi

    this.seatRows = Array.from({ length: numRows }, (_, i) => String.fromCharCode(65 + i));

    // Genera un array per la disponibilità distribuendo casualmente i posti occupati
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
    let seatCount = 0;

    for (const row of this.seatRows) {
      for (let i = 1; i <= this.seatsPerRow; i++) {
        this.seats.push({
          id: `${row}${i}`,
          row: row,
          number: i,
          available: seatAvailability[seatCount],
          selected: false
        });
        seatCount++;
      }
    }
  }

  getSeatsForRow(rowLetter: string): Seat[] {
    return this.seats.filter(s => s.row === rowLetter);
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

    const formattedTime = new Date(this.selectedShowing!.starts_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    this.movieService.bookSeats(bookingData).subscribe({
      next: (response) => {
        this.bookingSummary = {
          confirmed: true,
          movie: this.movie!.title,
          date: this.selectedDate,
          time: formattedTime,
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
          time: formattedTime,
          seats: this.selectedSeats,
          totalPrice: this.selectedSeats.length * 10,
          error: 'Errore nella prenotazione. Riprova più tardi.'
        };
        this.showBookingSummary = true;
        this.bookingLoading = false;
      }
    });
  }

  cancelSelection(): void {
    this.showSeatSelector = false;
    this.selectedShowing = null;
    this.selectedSeats = [];
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