import { Film } from './film.model';

export interface Hall {
  id: number;
  name: string;
  capacity: number;
}

export interface Screening {
  id: number;
  starts_at: string;
  film: Film;
  hall: Hall;
  available_seats: number;
}
