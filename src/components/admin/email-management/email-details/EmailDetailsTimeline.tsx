
import React from "react";
import { format } from "date-fns";

interface EmailDetailsTimelineProps {
  sentAt: string;
  openedAt: string | null;
  clickedAt: string | null;
  recipientEmail: string | undefined;
}

export const EmailDetailsTimeline: React.FC<EmailDetailsTimelineProps> = ({
  sentAt,
  openedAt,
  clickedAt,
  recipientEmail,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div className="flex flex-col items-center">
          <div className="rounded-full w-8 h-8 bg-green-100 flex items-center justify-center">
            <span className="text-green-600">✓</span>
          </div>
          <div className="w-0.5 h-12 bg-gray-200"></div>
        </div>
        <div>
          <h4 className="font-medium">Email Sent</h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(sentAt), 'MMM d, yyyy HH:mm:ss')}
          </p>
          <p className="text-sm mt-1">
            Email was sent to {recipientEmail || "the recipient"}
          </p>
        </div>
      </div>

      {openedAt && (
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center">
            <div className="rounded-full w-8 h-8 bg-purple-100 flex items-center justify-center">
              <span className="text-purple-600">✓</span>
            </div>
            {clickedAt && <div className="w-0.5 h-12 bg-gray-200"></div>}
          </div>
          <div>
            <h4 className="font-medium">Email Opened</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(openedAt), 'MMM d, yyyy HH:mm:ss')}
            </p>
            <p className="text-sm mt-1">
              The recipient opened the email
            </p>
          </div>
        </div>
      )}

      {clickedAt && (
        <div className="flex items-start space-x-3">
          <div className="rounded-full w-8 h-8 bg-yellow-100 flex items-center justify-center">
            <span className="text-yellow-600">✓</span>
          </div>
          <div>
            <h4 className="font-medium">Link Clicked</h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(clickedAt), 'MMM d, yyyy HH:mm:ss')}
            </p>
            <p className="text-sm mt-1">
              The recipient clicked on a link in the email
            </p>
          </div>
        </div>
      )}
      
      {!openedAt && !clickedAt && (
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center">
            <div className="rounded-full w-8 h-8 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">⌛</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Awaiting Interaction</h4>
            <p className="text-sm text-muted-foreground">
              The recipient has not yet interacted with the email
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
