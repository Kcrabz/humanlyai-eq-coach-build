
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css';

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

// Handle PWA standalone mode detection
const initPwaFeatures = () => {
  try {
    const isRunningAsPWA = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
    
    if (isRunningAsPWA) {
      document.documentElement.classList.add('pwa');
      document.body.classList.add('pwa');
      console.log('Running as installed PWA');
    } else {
      document.documentElement.classList.remove('pwa');
      document.body.classList.remove('pwa');
    }
  } catch (err) {
    console.error('Error detecting PWA mode:', err);
  }
};

// Utility function to detect if app is in PWA mode
window.isPwaMode = function(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Initialize the application
const initializeApp = () => {
  try {
    console.log("Initializing application...");
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      console.error("Root element not found!");
      return;
    }

    console.log("Creating React root...");
    const reactRoot = createRoot(rootElement);
    
    console.log("Rendering app...");
    reactRoot.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Register service worker after the app is loaded
    registerServiceWorker();
    
    // Initialize PWA features
    initPwaFeatures();
    
    // Setup event listener for display mode changes
    const mediaQueryList = window.matchMedia('(display-mode: standalone)');
    mediaQueryList.addEventListener('change', initPwaFeatures);
    
    console.log("Application initialized successfully");
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
console.log("Starting application initialization...");
initializeApp();
