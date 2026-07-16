import { Screening } from '../models';
import { MOCK_FILMS } from './mock-films';

export const MOCK_SCREENINGS: Screening[] = [
  {
    id: 1,
    starts_at: '2026-07-16T14:30:00',
    film: MOCK_FILMS[0],
    hall: { id: 1, name: 'Sala 1 - IMAX', capacity: 200 },
    available_seats: 45
  },
  {
    id: 2,
    starts_at: '2026-07-16T17:00:00',
    film: MOCK_FILMS[0],
    hall: { id: 1, name: 'Sala 1 - IMAX', capacity: 200 },
    available_seats: 120
  },
  {
    id: 3,
    starts_at: '2026-07-16T20:00:00',
    film: MOCK_FILMS[0],
    hall: { id: 2, name: 'Sala 2', capacity: 120 },
    available_seats: 80
  },
  {
    id: 4,
    starts_at: '2026-07-16T15:00:00',
    film: MOCK_FILMS[1],
    hall: { id: 3, name: 'Sala 3', capacity: 150 },
    available_seats: 60
  },
  {
    id: 5,
    starts_at: '2026-07-16T19:30:00',
    film: MOCK_FILMS[1],
    hall: { id: 1, name: 'Sala 1 - IMAX', capacity: 200 },
    available_seats: 30
  },
  {
    id: 6,
    starts_at: '2026-07-16T16:00:00',
    film: MOCK_FILMS[2],
    hall: { id: 2, name: 'Sala 2', capacity: 120 },
    available_seats: 95
  },
  {
    id: 7,
    starts_at: '2026-07-16T21:00:00',
    film: MOCK_FILMS[2],
    hall: { id: 4, name: 'Sala 4', capacity: 80 },
    available_seats: 50
  },
  {
    id: 8,
    starts_at: '2026-07-16T14:00:00',
    film: MOCK_FILMS[3],
    hall: { id: 3, name: 'Sala 3', capacity: 150 },
    available_seats: 70
  },
  {
    id: 9,
    starts_at: '2026-07-16T20:30:00',
    film: MOCK_FILMS[3],
    hall: { id: 1, name: 'Sala 1 - IMAX', capacity: 200 },
    available_seats: 25
  },
  {
    id: 10,
    starts_at: '2026-07-16T15:30:00',
    film: MOCK_FILMS[4],
    hall: { id: 4, name: 'Sala 4', capacity: 80 },
    available_seats: 40
  },
  {
    id: 11,
    starts_at: '2026-07-16T18:00:00',
    film: MOCK_FILMS[5],
    hall: { id: 2, name: 'Sala 2', capacity: 120 },
    available_seats: 110
  },
  {
    id: 12,
    starts_at: '2026-07-16T21:30:00',
    film: MOCK_FILMS[5],
    hall: { id: 1, name: 'Sala 1 - IMAX', capacity: 200 },
    available_seats: 15
  }
];
