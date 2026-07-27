import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  movies: Film[] = [];
  loading = true;
  error: string | null = null;

  isDragging = false;
  private startX = 0;
  private scrollLeftStart = 0;
  private autoScrollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getPopularMovies().subscribe({
      next: (res) => {
        this.movies = res.movies;
        this.loading = false;
        this.startAutoScroll();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei film:', err);
        this.error = 'Errore nel caricamento dei film';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  scrollLeft(): void {
    this.stopAutoScroll();
    const el = this.carouselTrack.nativeElement;
    el.scrollBy({ left: -320, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.stopAutoScroll();
    const el = this.carouselTrack.nativeElement;
    el.scrollBy({ left: 320, behavior: 'smooth' });
  }

  private startAutoScroll(): void {
    this.autoScrollInterval = setInterval(() => {
      const el = this.carouselTrack?.nativeElement;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 320, behavior: 'smooth' });
      }
    }, 5000);
  }

  private stopAutoScroll(): void {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  onDragStart(e: MouseEvent): void {
    this.isDragging = true;
    this.startX = e.pageX;
    this.scrollLeftStart = this.carouselTrack.nativeElement.scrollLeft;
    this.stopAutoScroll();
  }

  onDragMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    e.preventDefault();
    const el = this.carouselTrack.nativeElement;
    const dx = e.pageX - this.startX;
    el.scrollLeft = this.scrollLeftStart - dx;
  }

  onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.startAutoScroll();
  }

  onMouseEnter(): void {
    this.stopAutoScroll();
  }

  onMouseLeave(): void {
    this.startAutoScroll();
  }
}
