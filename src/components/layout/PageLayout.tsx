
import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { useLocation } from "react-router-dom";

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function PageLayout({ children, fullWidth = false }: PageLayoutProps) {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  
  // Don't show header on onboarding pages
  const showHeader = !location.pathname.includes("/onboarding");

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      <main className={`flex-1 ${fullWidth ? "" : "container py-8"}`}>
        {children}
      </main>
    </div>
  );
}
