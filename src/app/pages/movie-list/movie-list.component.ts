import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { Film, TmdbGenre } from '../../models';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css'
})
export class MovieListComponent implements OnInit {
  movies: Film[] = [];
  filteredMovies: Film[] = [];
  loading = true;
  error: string | null = null;

  searchQuery = '';
  selectedGenreId = '';
  genres: TmdbGenre[] = [];

  private searchSubject = new Subject<string>();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadMovies();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query.trim()) {
          return this.selectedGenreId
            ? this.movieService.getMoviesByGenre(Number(this.selectedGenreId))
            : this.movieService.getPopularMovies();
        }
        return this.movieService.searchMovies(query);
      })
    ).subscribe({
      next: (data) => {
        this.movies = data;
        this.applyLocalFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nella ricerca:', err);
        this.error = 'Errore nella ricerca film';
        this.loading = false;
      }
    });
  }

  loadGenres(): void {
    this.movieService.getAllGenres().subscribe({
      next: (genres) => this.genres = genres,
      error: (err) => console.error('Errore nel caricamento dei generi:', err)
    });
  }

  loadMovies(): void {
    this.loading = true;
    this.error = null;
    this.movieService.getPopularMovies().subscribe({
      next: (data) => {
        this.movies = data;
        this.filteredMovies = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei film:', err);
        this.error = 'Errore nel caricamento dei film. Riprova più tardi.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.loading = true;
    this.searchSubject.next(this.searchQuery);
  }

  onGenreChange(): void {
    if (!this.selectedGenreId) {
      this.loadMovies();
      return;
    }
    this.loading = true;
    this.movieService.getMoviesByGenre(Number(this.selectedGenreId)).subscribe({
      next: (data) => {
        this.movies = data;
        this.applyLocalFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel filtro genere:', err);
        this.error = 'Errore nel filtro per genere';
        this.loading = false;
      }
    });
  }

  private applyLocalFilters(): void {
    this.filteredMovies = this.movies.filter(movie => {
      if (!this.searchQuery.trim()) return true;
      const q = this.searchQuery.toLowerCase();
      return movie.title.toLowerCase().includes(q) ||
             (movie.director && movie.director.toLowerCase().includes(q));
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedGenreId = '';
    this.loadMovies();
  }
}
