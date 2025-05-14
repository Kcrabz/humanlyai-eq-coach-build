
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  deferredPrompt: any;
  isPwaMode: () => boolean;
  isMobileDevice: () => boolean;
}
