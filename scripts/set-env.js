const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'src', 'environments', 'environment.ts');

const content = `export const environment = {
  production: true,
  tmdbApiKey: '${process.env.TMDB_API_KEY || ''}',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p/w500'
};
`;

fs.writeFileSync(envPath, content, 'utf8');
console.log('environment.ts generato con successo');
