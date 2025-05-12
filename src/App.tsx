
// Import existing providers
import { AuthProvider } from "./context/AuthContext"; 
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";
import AppRoutes from "./AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatMemoryProvider } from "./context/ChatMemoryContext";

// Create a new query client
const queryClient = new QueryClient();

// Provider wrapper component for better organization
function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="humanly-theme">
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
