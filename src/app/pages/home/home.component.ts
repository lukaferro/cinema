import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { Film } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

  movies: Film[] = [];
  loading = true;
  error: string | null = null;

  isDragging = false;
  private startX = 0;
  private scrollLeftStart = 0;
  private pendingDx = 0;
  private rafId: number | null = null;
  private autoScrollInterval: ReturnType<typeof setInterval> | null = null;

  constructor(private movieService: MovieService, private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.movieService.getPopularMovies().subscribe({
      next: (res) => {
        this.movies = res.movies;
        this.loading = false;
        this.cdr.markForCheck();
        this.startAutoScroll();
      },
      error: (err) => {
        console.error('Errore nel caricamento dei film:', err);
        this.error = 'Errore nel caricamento dei film';
        this.loading = false;
        this.cdr.markForCheck();
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
    this.ngZone.runOutsideAngular(() => {
      this.autoScrollInterval = setInterval(() => {
        const el = this.carouselTrack?.nativeElement;
        if (!el) return;
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }, 5000);
    });
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
    this.pendingDx = e.pageX - this.startX;
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.carouselTrack.nativeElement.scrollLeft = this.scrollLeftStart - this.pendingDx;
        this.rafId = null;
      });
    }
  }

  onDragEnd(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.snapToNearest();
  }

  private snapToNearest(): void {
    const el = this.carouselTrack.nativeElement;
    const cards = el.children;
    let closestCard = cards[0] as HTMLElement;
    let minDist = Infinity;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i] as HTMLElement;
      const dist = Math.abs(card.offsetLeft - el.scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closestCard = card;
      }
    }
    el.scrollTo({ left: closestCard.offsetLeft, behavior: 'smooth' });
  }

  onMouseEnter(): void {
    this.stopAutoScroll();
  }

  onMouseLeave(): void {
    this.startAutoScroll();
  }
}
