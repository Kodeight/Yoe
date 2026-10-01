import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppProvider } from './context/AppContext.tsx';
import { AudioProvider } from './context/AudioContext.tsx';

// Register PWA service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('PWA SW registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <AudioProvider>
      <App />
    </AudioProvider>
  </AppProvider>
);
