
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function EmptyChatState() {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col items-center justify-center h-full text-center p-4 ${isMobile ? 'pt-2' : 'pt-4'}`}>
      <div className="mb-4">
        <span className="inline-block p-4 rounded-full bg-humanly-teal-light/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-humanly-teal"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      </div>
      <h3 className="text-xl font-medium">Your EQ Coach is Ready</h3>
      <p className="text-muted-foreground mt-2 max-w-md">
        Ask a question or share what's on your mind to start your coaching session.
      </p>
    </div>
  );
}
