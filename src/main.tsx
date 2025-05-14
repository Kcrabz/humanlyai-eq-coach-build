
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css';
import './styles/pwa/pwa-specific.css';

// Create function for registering service worker to better handle errors
const registerServiceWorker = async () => {
  try {
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
        }
      },
      onRegisterError(error) {
        console.error('Service worker registration error:', error);
      }
    });
  } catch (err) {
    console.error('Failed to register service worker:', err);
  }
};

// Enhanced PWA detection with proper class application
const initPwaFeatures = () => {
  try {
    const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
    
    // Apply the PWA class to both html and body for complete styling coverage
    if (isRunningAsPWA) {
      document.documentElement.classList.add('pwa');
      document.body.classList.add('pwa');
      console.log('Running as installed PWA');
      
      // Set PWA mode for the app, used by AuthenticationGuard
      localStorage.setItem('is_pwa_mode', 'true');
      
      // Store pending paths if needed, but let AuthenticationGuard handle navigation
      if (window.location.pathname !== '/' && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/signup') {
        console.log('PWA: Storing desired path:', window.location.pathname);
        sessionStorage.setItem('pwa_desired_path', window.location.pathname);
      }
    } else {
      // Ensure we're not in PWA mode
      localStorage.removeItem('is_pwa_mode');
    }
  } catch (err) {
    console.error('Error detecting PWA mode:', err);
  }
};

// Enhanced utility function to detect if app is in PWA mode - properly defined as a window property
window.isPwaMode = function(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('is_pwa_mode') === 'true'
    );
  } catch (e) {
    return false;
  }
};

// Initialize the application with error handling
const initializeApp = () => {
  try {
    const root = document.getElementById("root");
    if (!root) {
      console.error("Root element not found!");
      return;
    }

    createRoot(root).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Initialize PWA features first
    initPwaFeatures();
    
    // Register service worker after the app is loaded
    registerServiceWorker();
    
    // Add additional PWA detection for login flow
    window.addEventListener('DOMContentLoaded', () => {
      if (window.isPwaMode()) {
        console.log('PWA detected on DOMContentLoaded, current path:', window.location.pathname);
      }
    });
    
  } catch (err) {
    console.error('Failed to initialize application:', err);
    // Display a fallback error message in the DOM
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="color: red; padding: 20px; text-align: center;">
          <h2>Something went wrong loading the application</h2>
          <p>Please try refreshing the page. If the problem persists, please contact support.</p>
          <pre>${err instanceof Error ? err.message : String(err)}</pre>
        </div>
      `;
    }
  }
};

// Initialize the application
initializeApp();
