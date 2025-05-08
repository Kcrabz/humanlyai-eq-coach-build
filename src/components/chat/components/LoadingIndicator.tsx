
import React from "react";

export function LoadingIndicator() {
  return (
    <div className="animate-pulse flex space-x-1 justify-center">
      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
      <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
    </div>
  );
}
