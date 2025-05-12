
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface EmailCustomMessageProps {
  customMessage: string;
  setCustomMessage: (message: string) => void;
}

export const EmailCustomMessage: React.FC<EmailCustomMessageProps> = ({
  customMessage,
  setCustomMessage
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Custom Message</label>
      <Textarea
        placeholder="Add a custom message to include in the email..."
        value={customMessage}
        onChange={(e) => setCustomMessage(e.target.value)}
        rows={4}
      />
    </div>
  );
};
