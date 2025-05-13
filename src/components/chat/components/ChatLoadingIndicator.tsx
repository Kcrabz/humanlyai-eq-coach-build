
import React from "react";
import { TypingIndicator } from "./TypingIndicator";

export function ChatLoadingIndicator() {
  return (
    <div className="flex justify-center my-4">
      <TypingIndicator />
    </div>
  );
}
