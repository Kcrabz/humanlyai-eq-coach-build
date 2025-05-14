
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
    // Detect PWA mode with multiple checks to ensure reliability
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
    const isMobileApp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    console.log("PWA detection:", {
      isStandalone,
      isMobileUserAgent: isMobileApp,
      standalone: (window.navigator as any).standalone,
      matchMedia: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent,
      previouslyDetected: localStorage.getItem('is_pwa_mode') === 'true'
    });
    
    const isRunningAsPWA = isStandalone;
    
    // Apply the PWA class to both html and body for complete styling coverage
    if (isRunningAsPWA) {
      document.documentElement.classList.add('pwa');
      document.body.classList.add('pwa');
      console.log('Running as installed PWA');
      
      // Set PWA mode for the app
      localStorage.setItem('is_pwa_mode', 'true');
      
      // Store pending paths if needed
      if (window.location.pathname !== '/' && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/signup') {
        console.log('PWA: Storing desired path:', window.location.pathname);
        sessionStorage.setItem('pwa_desired_path', window.location.pathname);
      }
      
      // For mobile devices, add special mobile-related classes too
      if (isMobileApp) {
        document.documentElement.classList.add('mobile');
        document.body.classList.add('mobile');
        localStorage.setItem('is_mobile_device', 'true');
      }
    } else if (isMobileApp) {
      // Even if not PWA, still track mobile status
      document.documentElement.classList.add('mobile');
      document.body.classList.add('mobile');
      localStorage.setItem('is_mobile_device', 'true');
      
      // Ensure we're not in PWA mode
      localStorage.removeItem('is_pwa_mode');
    } else {
      // Ensure we're not in PWA or mobile mode
      localStorage.removeItem('is_pwa_mode');
      localStorage.removeItem('is_mobile_device');
    }
  } catch (err) {
    console.error('Error detecting PWA mode:', err);
  }
};

// Enhanced utility function to detect if app is in PWA mode - attached to window
window.isPwaMode = function(): boolean {
  try {
    // Check both standard detection and our custom flag
    return (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      localStorage.getItem('is_pwa_mode') === 'true'
    );
  } catch (e) {
    return false;
  }
};

// Add utility to detect mobile devices - attached to window
window.isMobileDevice = function(): boolean {
  try {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      localStorage.getItem('is_mobile_device') === 'true'
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

    // Initialize PWA features first
    initPwaFeatures();

    createRoot(root).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Register service worker after the app is loaded
    registerServiceWorker();
    
    // Add additional PWA detection for login flow
    window.addEventListener('DOMContentLoaded', () => {
      if (window.isPwaMode() || window.isMobileDevice()) {
        console.log('Mobile/PWA detected on DOMContentLoaded, current path:', window.location.pathname);
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

// Add type definition for Window interface - moved outside the duplicate declaration
declare global {
  interface Window {
    isPwaMode: () => boolean;
    isMobileDevice: () => boolean;
    _isPwaMode?: boolean;
  }
}

// Initialize the application
initializeApp();
