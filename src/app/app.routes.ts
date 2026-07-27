import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MovieListComponent } from './pages/movie-list/movie-list.component';
import { MovieDetailsComponent } from './pages/movie-details/movie-details.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'CinemaHub - Scopri e Prenota i Tuoi Film Preferiti' },
  { path: 'movies', component: MovieListComponent, title: 'Film - CinemaHub' },
  { path: 'movie/:id', component: MovieDetailsComponent, title: 'Dettagli Film - CinemaHub' },
  { path: 'about', component: AboutComponent, title: 'Chi Siamo - CinemaHub' },
  { path: 'contact', component: ContactComponent, title: 'Contattaci - CinemaHub' },
  { path: '**', redirectTo: '' }
];
