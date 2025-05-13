import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css';
import './styles/animations.css';
import './styles/base.css';
import './styles/chat.css';
import './styles/components.css';
import './styles/layout.css';

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
          
          // Check if we need to redirect after PWA installation
          const redirectPath = localStorage.getItem('pwa_redirect_after_login');
          if (redirectPath) {
            console.log('Found pending PWA redirect after login to:', redirectPath);
            window.location.href = redirectPath;
            localStorage.removeItem('pwa_redirect_after_login');
          }
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

// Handle PWA standalone mode detection
const initPwaFeatures = () => {
  try {
    const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
    
    if (isRunningAsPWA) {
      document.body.classList.add('pwa-mode');
      console.log('Running as installed PWA');
      
      // Store current path in sessionStorage if we're on a path that requires login
      // This helps post-login navigation in PWA environments
      if (window.location.pathname !== '/' && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/signup') {
        sessionStorage.setItem('pwa_desired_path', window.location.pathname);
        console.log('Stored desired path for PWA:', window.location.pathname);
      }
      
      // Force a load to the intended page when in PWA mode
      const desiredPath = sessionStorage.getItem('pwa_desired_path');
      if (desiredPath && window.location.pathname === '/') {
        console.log('Redirecting to desired path in PWA:', desiredPath);
        window.location.href = desiredPath;
        sessionStorage.removeItem('pwa_desired_path');
      }
    }
  } catch (err) {
    console.error('Error detecting PWA mode:', err);
  }
};

// Utility function to detect if app is in PWA mode - properly defined as a window property
window.isPwaMode = function(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
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

    // Register service worker after the app is loaded
    registerServiceWorker();
    
    // Initialize PWA features
    initPwaFeatures();
    
    // Add additional PWA detection for login flow
    window.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, PWA status:', window.isPwaMode());
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
