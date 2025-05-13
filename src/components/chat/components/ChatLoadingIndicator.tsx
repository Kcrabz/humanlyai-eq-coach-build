
import React, { useEffect } from "react";
import { TypingIndicator } from "./TypingIndicator";

export function ChatLoadingIndicator() {
  // Log when this component mounts and unmounts for debugging
  useEffect(() => {
    console.log("ChatLoadingIndicator mounted");
    return () => {
      console.log("ChatLoadingIndicator unmounted");
    };
  }, []);

  return (
    <div className="flex justify-center my-4">
      <TypingIndicator />
    </div>
  );
}
