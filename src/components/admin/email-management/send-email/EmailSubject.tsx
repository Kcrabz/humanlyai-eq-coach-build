
import React from 'react';
import { Input } from "@/components/ui/input";

interface EmailSubjectProps {
  subject: string;
  setSubject: (subject: string) => void;
}

export const EmailSubject: React.FC<EmailSubjectProps> = ({
  subject,
  setSubject
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Subject</label>
      <Input
        placeholder="Email subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
    </div>
  );
};
