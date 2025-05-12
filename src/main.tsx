
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Register service worker with custom event dispatch
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(r) {
    if (r) {
      console.log('Service worker registered');
      
      // Dispatch event on registration to handle PWA-specific UI adjustments
      window.dispatchEvent(new CustomEvent('pwa-registered'));
      
      // Since onSuccess doesn't exist, dispatch the update event here instead
      window.dispatchEvent(new CustomEvent('pwa-update-available'));
    }
  },
  onRegisterError(error) {
    console.error('Service worker registration error:', error);
  }
});

// Add event listener for standalone mode detection
window.addEventListener('DOMContentLoaded', () => {
  // Check if running as installed PWA
  const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
  
  if (isRunningAsPWA) {
    document.body.classList.add('pwa-mode');
    console.log('Running as installed PWA');
  }
});

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
