
// Import existing providers
import { AuthProvider } from "./context/auth/AuthProvider"; 
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";
import AppRoutes from "./AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatMemoryProvider } from "./context/ChatMemoryContext";
import { THEME_STORAGE_KEY } from "./constants/storageKeys";

// Create a new query client with more robust error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    }
  },
});

// Set up global error handling using proper API
queryClient.setDefaultOptions({
  queries: {
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error);
      }
    }
  },
  mutations: {
    meta: {
      onError: (error: Error) => {
        console.error('Mutation error:', error);
      }
    }
  }
});

// Provider wrapper component for better organization
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey={THEME_STORAGE_KEY}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChatMemoryProvider>
            {children}
          </ChatMemoryProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <Toaster />
    </AppProviders>
  );
}

export default App;
