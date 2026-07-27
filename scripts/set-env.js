const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'src', 'environments', 'env.ts');

const content = `export const ENV = {
  tmdbApiKey: '${process.env.TMDB_API_KEY || ''}',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p/w500'
};
`;

fs.writeFileSync(envPath, content, 'utf8');
console.log('env.ts generato con successo');
