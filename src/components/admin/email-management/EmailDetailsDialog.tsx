
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = React.useState("details");

  // Format email data for display
  const formatEmailData = (data: any) => {
    if (!data) return "No data";
    
    try {
      // Filter out any large or complex objects that might make the display cluttered
      const cleanData = { ...data };
      
      // Return the formatted JSON
      return JSON.stringify(cleanData, null, 2);
    } catch (err) {
      console.error("Error formatting email data:", err);
      return "Error formatting data";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
          <DialogDescription>
            Email sent on {format(new Date(email.sent_at), 'MMM d, yyyy HH:mm')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
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

            <div>
              <h4 className="text-sm font-medium mb-1">Template Description</h4>
              <p className="text-sm">
                {email.template_name === 'daily-nudge' && 
                  "Daily challenge to engage users in EQ development activities"}
                {email.template_name === 'weekly-summary' && 
                  "Weekly progress report showing user's achievements and growth"}
                {email.template_name === 're-engagement' && 
                  "Re-engagement email to bring back users who haven't logged in recently"}
                {!['daily-nudge', 'weekly-summary', 're-engagement'].includes(email.template_name) && 
                  "Custom email template"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
              <div>
                <h4 className="text-sm font-medium mb-1">Clicked At</h4>
                <p className="text-sm">
                  {email.clicked_at
                    ? format(new Date(email.clicked_at), 'MMM d, yyyy HH:mm:ss')
                    : "No clicks"}
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Email Data</h4>
              <div className="bg-muted rounded-md p-4 overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {formatEmailData(email.email_data)}
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
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
                    {format(new Date(email.sent_at), 'MMM d, yyyy HH:mm:ss')}
                  </p>
                  <p className="text-sm mt-1">
                    Email was sent to {recipient?.email || "the recipient"}
                  </p>
                </div>
              </div>

              {email.opened_at && (
                <div className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full w-8 h-8 bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600">✓</span>
                    </div>
                    {email.clicked_at && <div className="w-0.5 h-12 bg-gray-200"></div>}
                  </div>
                  <div>
                    <h4 className="font-medium">Email Opened</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(email.opened_at), 'MMM d, yyyy HH:mm:ss')}
                    </p>
                    <p className="text-sm mt-1">
                      The recipient opened the email
                    </p>
                  </div>
                </div>
              )}

              {email.clicked_at && (
                <div className="flex items-start space-x-3">
                  <div className="rounded-full w-8 h-8 bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Link Clicked</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(email.clicked_at), 'MMM d, yyyy HH:mm:ss')}
                    </p>
                    <p className="text-sm mt-1">
                      The recipient clicked on a link in the email
                    </p>
                  </div>
                </div>
              )}
              
              {!email.opened_at && !email.clicked_at && (
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
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
