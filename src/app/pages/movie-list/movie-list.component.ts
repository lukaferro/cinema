import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MovieService } from '../../services/movie.service';
import { Film, TmdbGenre } from '../../models';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieListComponent implements OnInit {
  movies: Film[] = [];
  loading = true;
  error: string | null = null;

  searchQuery = '';
  selectedGenreId = '';
  genres: TmdbGenre[] = [];

  currentPage = 1;
  totalPages = 1;
  maxVisiblePages = 7;

  cachedPageNumbers: (number | string)[] = [];

  private searchSubject = new Subject<string>();

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.loadMovies();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        this.currentPage = 1;
        if (!query.trim()) {
          return this.selectedGenreId
            ? this.movieService.getMoviesByGenre(Number(this.selectedGenreId), 1)
            : this.movieService.getPopularMovies(1);
        }
        return this.movieService.searchMovies(query, 1);
      })
    ).subscribe({
      next: (res) => {
        this.movies = res.movies;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.updateCachedPageNumbers();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nella ricerca:', err);
        this.error = 'Errore nella ricerca film';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadGenres(): void {
    this.movieService.getAllGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Errore nel caricamento dei generi:', err)
    });
  }

  loadMovies(): void {
    this.loading = true;
    this.error = null;
    this.movieService.getPopularMovies(this.currentPage).subscribe({
      next: (res) => {
        this.movies = res.movies;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.updateCachedPageNumbers();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei film:', err);
        this.error = 'Errore nel caricamento dei film. Riprova più tardi.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(): void {
    this.loading = true;
    this.searchSubject.next(this.searchQuery);
  }

  onGenreChange(): void {
    this.currentPage = 1;
    if (!this.selectedGenreId) {
      this.loadMovies();
      return;
    }
    this.loading = true;
    this.movieService.getMoviesByGenre(Number(this.selectedGenreId), 1).subscribe({
      next: (res) => {
        this.movies = res.movies;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.updateCachedPageNumbers();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Errore nel filtro genere:', err);
        this.error = 'Errore nel filtro per genere';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.loading = true;
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });

    if (this.searchQuery.trim()) {
      this.movieService.searchMovies(this.searchQuery, page).subscribe({
        next: (res) => {
          this.movies = res.movies;
          this.totalPages = res.totalPages;
          this.loading = false;
          this.updateCachedPageNumbers();
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
    } else if (this.selectedGenreId) {
      this.movieService.getMoviesByGenre(Number(this.selectedGenreId), page).subscribe({
        next: (res) => {
          this.movies = res.movies;
          this.totalPages = res.totalPages;
          this.loading = false;
          this.updateCachedPageNumbers();
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
    } else {
      this.movieService.getPopularMovies(page).subscribe({
        next: (res) => {
          this.movies = res.movies;
          this.totalPages = res.totalPages;
          this.loading = false;
          this.updateCachedPageNumbers();
          this.cdr.markForCheck();
        },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
    }
  }

  getPageNumbers(): (number | string)[] {
    return this.cachedPageNumbers;
  }

  private updateCachedPageNumbers(): void {
    const pages: (number | string)[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);

    if (end - start < this.maxVisiblePages - 1) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < this.totalPages) {
      if (end < this.totalPages - 1) pages.push('...');
      pages.push(this.totalPages);
    }

    this.cachedPageNumbers = pages;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedGenreId = '';
    this.currentPage = 1;
    this.loadMovies();
  }
}
