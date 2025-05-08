
import { ReactNode } from "react";

export function Footer() {
  return (
    <footer className="bg-foreground/5 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} HumanlyAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
