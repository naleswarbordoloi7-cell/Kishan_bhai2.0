import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerServiceWorker } from './services/serviceWorkerRegistration';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Service Worker for offline field capability
registerServiceWorker({
  onSuccess: () => {
    console.log('[Kisan Bhai] Offline farm data and core application cached successfully.');
  },
  onUpdate: () => {
    console.log('[Kisan Bhai] New version available for update.');
  },
});

