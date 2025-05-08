
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CollapsibleMenu } from "./CollapsibleMenu";

interface PageLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function PageLayout({ children, fullWidth = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CollapsibleMenu />
      <Header />
      <main className={`flex-grow ${fullWidth ? '' : 'container mx-auto px-4 md:px-6 pb-12'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
