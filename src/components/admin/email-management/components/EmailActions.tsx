
import React from 'react';
import { Button } from "@/components/ui/button";
import { Eye, Send, RefreshCw } from "lucide-react";

interface EmailActionsProps {
  onShowTemplatePreview: () => void;
  onShowSendDialog: () => void;
  onRefresh: () => void;
}

export const EmailActions: React.FC<EmailActionsProps> = ({
  onShowTemplatePreview,
  onShowSendDialog,
  onRefresh
}) => {
  return (
    <div className="flex space-x-2">
      <Button onClick={onShowTemplatePreview} variant="outline" className="flex items-center">
        <Eye className="mr-2 h-4 w-4" />
        View Templates
      </Button>
      <Button onClick={onShowSendDialog} className="flex items-center">
        <Send className="mr-2 h-4 w-4" />
        Send Email
      </Button>
      <Button variant="outline" onClick={onRefresh} className="flex items-center">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};
