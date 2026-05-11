import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Film } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  movies: Film[] = [];
  loading = true;
  error: string | null = null;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getMovies().subscribe({
      next: (data) => {
        this.movies = data.slice(0, 8); // Mostra i primi 8 film
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento dei film:', err);
        this.error = 'Errore nel caricamento dei film';
        this.loading = false;
      }
    });
  }
}
