import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { Film } from '../../models';

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
  selectedGenre = '';
  genres: string[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.movieService.getMovies().subscribe({
      next: (data) => {
        this.movies = data;
        this.filteredMovies = data;
        this.extractGenres();
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei film:', err);
        this.error = 'Errore nel caricamento dei film. Riprova più tardi.';
        this.loading = false;
      }
    });
  }

  extractGenres(): void {
    const genreSet = new Set<string>();
    this.movies.forEach(movie => {
      if (movie.genre) {
        genreSet.add(movie.genre);
      }
    });
    this.genres = Array.from(genreSet).sort();
  }

  filterMovies(): void {
    this.filteredMovies = this.movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          (movie.director && movie.director.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchesGenre = !this.selectedGenre || movie.genre === this.selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }

  onSearchChange(): void {
    this.filterMovies();
  }

  onGenreChange(): void {
    this.filterMovies();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.filteredMovies = this.movies;
  }
}