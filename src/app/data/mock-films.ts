import { Film } from '../models';

export const MOCK_FILMS: Film[] = [
  {
    id: 1,
    title: 'Il Padrino',
    genre: 'Drammatico',
    duration: 175,
    director: 'Francis Ford Coppola',
    description: 'La storia della famiglia mafiosa Corleone, guidata dal patriarca Don Vito Corleone. Un capolavoro assoluto del cinema che esplora potere, lealtà e tradimento.',
    poster_url: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    year: 1972,
    rating: 'R'
  },
  {
    id: 2,
    title: 'Inception',
    genre: 'Fantascienza',
    duration: 148,
    director: 'Christopher Nolan',
    description: 'Un ladro specializzato nell\'estrarre segreti dai sogni delle persone riceve un\'impossibile ultima missione: non rubare un\'idea, ma piazzarne una.',
    poster_url: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg',
    year: 2010,
    rating: 'PG-13'
  },
  {
    id: 3,
    title: 'Pulp Fiction',
    genre: 'Thriller',
    duration: 154,
    director: 'Quentin Tarantino',
    description: 'Le vite di assassini, gangster e un pugile si intrecciano in quattro storie di violenza e redenzione raccontate fuori ordine cronologico.',
    poster_url: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    year: 1994,
    rating: 'R'
  },
  {
    id: 4,
    title: 'Interstellar',
    genre: 'Fantascienza',
    duration: 169,
    director: 'Christopher Nolan',
    description: 'Un gruppo di esploratori viaggia attraverso un buco nello spazio per assicurare il futuro dell\'umanità, lasciando dietro di sé la Terra morente.',
    poster_url: 'https://image.tmdb.org/t/p/w500/gEU2QniL6E31JHOk2a0xO3KYNnS.jpg',
    year: 2014,
    rating: 'PG-13'
  },
  {
    id: 5,
    title: 'La Lista di Schindler',
    genre: 'Drammatico',
    duration: 195,
    director: 'Steven Spielberg',
    description: 'Durante la Seconda Guerra Mondiale, l\'imprenditore Oskar Schindler salva la vita a oltre mille ebrei polacchi impiegandoli nelle sue fabbriche.',
    poster_url: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    year: 1993,
    rating: 'R'
  },
  {
    id: 6,
    title: 'Matrix',
    genre: 'Fantascienza',
    duration: 136,
    director: 'Lana e Lilly Wachowski',
    description: 'Un hacker scopre che la realtà che conosce è un\'illusione creata da macchine intelligenti per domare la razza umana e nutrirsi della sua energia.',
    poster_url: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    year: 1999,
    rating: 'R'
  }
];
