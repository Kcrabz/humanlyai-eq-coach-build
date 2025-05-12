
import React from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface EmailDetailsContentProps {
  recipient: { id: string; email: string } | undefined;
  emailType: string;
  emailStatus: string;
  templateName: string;
}

export const EmailDetailsContent: React.FC<EmailDetailsContentProps> = ({
  recipient,
  emailType,
  emailStatus,
  templateName,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Recipient</h4>
          <p className="text-sm">{recipient?.email || "Unknown user"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Status</h4>
          <Badge
            className={`
              ${emailStatus === 'sent' ? 'bg-green-500' : ''}
              ${emailStatus === 'delivered' ? 'bg-blue-500' : ''}
              ${emailStatus === 'opened' ? 'bg-purple-500' : ''}
              ${emailStatus === 'clicked' ? 'bg-yellow-500' : ''}
              ${emailStatus === 'failed' ? 'bg-red-500' : ''}
            `}
          >
            {emailStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Type</h4>
          <p className="text-sm">{emailType.replace(/_/g, ' ')}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Template</h4>
          <p className="text-sm">{templateName.replace(/-/g, ' ')}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-1">Template Description</h4>
        <p className="text-sm">
          {templateName === 'daily-nudge' && 
            "Daily challenge to engage users in EQ development activities"}
          {templateName === 'weekly-summary' && 
            "Weekly progress report showing user's achievements and growth"}
          {templateName === 're-engagement' && 
            "Re-engagement email to bring back users who haven't logged in recently"}
          {!['daily-nudge', 'weekly-summary', 're-engagement'].includes(templateName) && 
            "Custom email template"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Sent At</h4>
          <p className="text-sm">{format(new Date(emailStatus), 'MMM d, yyyy HH:mm:ss')}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Opened At</h4>
          <p className="text-sm">
            {emailStatus
              ? format(new Date(emailStatus), 'MMM d, yyyy HH:mm:ss')
              : "Not opened"}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Clicked At</h4>
          <p className="text-sm">
            {emailStatus
              ? format(new Date(emailStatus), 'MMM d, yyyy HH:mm:ss')
              : "No clicks"}
          </p>
        </div>
      </div>
    </div>
  );
};
