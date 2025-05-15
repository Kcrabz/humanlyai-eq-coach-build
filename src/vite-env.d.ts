
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  deferredPrompt: any;
  isPwaMode: () => boolean;
}

// Add CSS environment variables typings for TypeScript
interface CSSStyleDeclaration {
  'padding-bottom': string;
  'margin-bottom': string;
  'padding-top': string;
  'margin-top': string;
  'padding-left': string;
  'margin-left': string;
  'padding-right': string;
  'margin-right': string;
}
