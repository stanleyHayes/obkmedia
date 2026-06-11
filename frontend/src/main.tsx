import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '@fontsource/outfit/300.css';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeModeProvider } from './ThemeModeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeModeProvider>
  </StrictMode>,
);

// Fade out the static splash once the app has mounted (with a short minimum
// display so it doesn't flash on fast loads), then remove it from the DOM.
const splash = document.getElementById('obk-splash');
if (splash) {
  const MIN_MS = 650;
  const start = performance.now();
  requestAnimationFrame(() => {
    const wait = Math.max(0, MIN_MS - (performance.now() - start));
    window.setTimeout(() => {
      splash.classList.add('obk-hide');
      splash.addEventListener('transitionend', () => splash.remove(), { once: true });
    }, wait);
  });
}
