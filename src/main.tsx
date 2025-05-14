
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css';
import './styles/pwa/pwa-specific.css';
import { isPwaMode, isMobileDevice } from '@/services/authFlowService';

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
    const isAppInPwaMode = isPwaMode();
    const isAppOnMobileDevice = isMobileDevice();
    
    console.log("PWA detection:", {
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isMobileUserAgent: isAppOnMobileDevice,
      standalone: (window.navigator as any).standalone,
      matchMedia: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent,
      previouslyDetected: localStorage.getItem('is_pwa_mode') === 'true'
    });
    
    // Apply the PWA class to both html and body for complete styling coverage
    if (isAppInPwaMode) {
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
    } 
    
    // For mobile devices, add special mobile-related classes
    if (isAppOnMobileDevice) {
      document.documentElement.classList.add('mobile');
      document.body.classList.add('mobile');
      localStorage.setItem('is_mobile_device', 'true');
      
      // If not in PWA mode, make sure the flag is cleared
      if (!isAppInPwaMode) {
        localStorage.removeItem('is_pwa_mode');
      }
    } else {
      // Ensure we're not in mobile mode
      localStorage.removeItem('is_mobile_device');
    }
  } catch (err) {
    console.error('Error detecting PWA mode:', err);
  }
};

// Attach detection functions to window for global access
// These will use the centralized functions in authFlowService
window.isPwaMode = isPwaMode;
window.isMobileDevice = isMobileDevice;

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
      if (isPwaMode() || isMobileDevice()) {
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

// Add type definition for Window interface
declare global {
  interface Window {
    isPwaMode: () => boolean;
    isMobileDevice: () => boolean;
  }
}

// Initialize the application
initializeApp();
