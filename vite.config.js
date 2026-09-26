import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serwuje projekt pod /<nazwa-repo>/, więc base musi to odzwierciedlać,
// inaczej wszystkie ścieżki do JS/CSS w zbudowanej stronie będą wskazywać na root domeny
// i strona wyjdzie pusta (biały ekran).
export default defineConfig({
  plugins: [react()],
  base: '/sb1-flcyno/',
});
