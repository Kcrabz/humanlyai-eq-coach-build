
import React from "react";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface EmailDetailsHeaderProps {
  sentAt: string;
}

export const EmailDetailsHeader: React.FC<EmailDetailsHeaderProps> = ({ sentAt }) => {
  return (
    <DialogHeader>
      <DialogTitle>Email Details</DialogTitle>
      <DialogDescription>
        Email sent on {format(new Date(sentAt), 'MMM d, yyyy HH:mm')}
      </DialogDescription>
    </DialogHeader>
  );
};
