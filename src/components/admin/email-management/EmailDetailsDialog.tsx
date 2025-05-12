
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  template_name: string;
  status: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  email_data: any;
}

interface User {
  id: string;
  email: string;
}

interface EmailDetailsDialogProps {
  email: EmailLog;
  onClose: () => void;
  users: User[];
}

export default function EmailDetailsDialog({
  email,
  onClose,
  users,
}: EmailDetailsDialogProps) {
  const recipient = users.find(user => user.id === email.user_id);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
          <DialogDescription>
            Email sent on {format(new Date(email.sent_at), 'MMM d, yyyy HH:mm')}
          </DialogDescription>
        </DialogHeader>

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
                  ${email.status === 'sent' ? 'bg-green-500' : ''}
                  ${email.status === 'delivered' ? 'bg-blue-500' : ''}
                  ${email.status === 'opened' ? 'bg-purple-500' : ''}
                  ${email.status === 'clicked' ? 'bg-yellow-500' : ''}
                  ${email.status === 'failed' ? 'bg-red-500' : ''}
                `}
              >
                {email.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Type</h4>
              <p className="text-sm">{email.email_type.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Template</h4>
              <p className="text-sm">{email.template_name.replace(/-/g, ' ')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Sent At</h4>
              <p className="text-sm">{format(new Date(email.sent_at), 'MMM d, yyyy HH:mm:ss')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Opened At</h4>
              <p className="text-sm">
                {email.opened_at
                  ? format(new Date(email.opened_at), 'MMM d, yyyy HH:mm:ss')
                  : "Not opened"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Email Data</h4>
            <div className="bg-muted rounded-md p-4 overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(email.email_data, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
