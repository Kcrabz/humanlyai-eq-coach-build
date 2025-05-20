
import React from "react";
import { KaiAvatar } from "./KaiAvatar";

export function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="mb-6">
        <KaiAvatar size="lg" />
      </div>
      <h3 className="text-xl font-medium mb-2">Welcome to your EQ coaching session</h3>
      <p className="text-center text-muted-foreground mb-6">
        I'm Kai, your personal emotional intelligence coach. How can I help you today?
      </p>
      <div className="space-y-3 max-w-md w-full">
        <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
          What is emotional intelligence?
        </button>
        <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
          How can I improve my communication skills?
        </button>
        <button className="w-full p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
          Help me understand my emotions better
        </button>
      </div>
    </div>
  );
}
