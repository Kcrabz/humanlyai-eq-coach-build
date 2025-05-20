import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // Use React SWC plugin with explicit refresh configuration
    react({
      plugins: [],
      jsxImportSource: undefined,
      tsDecorators: false,
      devTarget: 'es2022',
      swcrc: false
    }),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: "Kai | EQ Coach",
        short_name: "Kai Coach",
        description: "Your Personal Emotional Intelligence Coach",
        theme_color: "#6366f1", // humanly-indigo color
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-icons/maskable-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        shortcuts: [
          {
            name: "Start Chat",
            short_name: "Chat",
            description: "Start a new chat with Kai",
            url: "/chat",
            icons: [{ src: "/pwa-icons/icon-96x96.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      }
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-tooltip', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  }
}));
