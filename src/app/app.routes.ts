import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MovieListComponent } from './pages/movie-list/movie-list.component';
import { MovieDetailsComponent } from './pages/movie-details/movie-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'movies', component: MovieListComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: '**', redirectTo: '' }
];
