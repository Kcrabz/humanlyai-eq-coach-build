
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailDetailsHeader } from "./EmailDetailsHeader";
import { EmailDetailsContent } from "./EmailDetailsContent";
import { EmailDetailsTimeline } from "./EmailDetailsTimeline";
import { EmailDetailsData } from "./EmailDetailsData";

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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <EmailDetailsHeader sentAt={email.sent_at} />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <EmailDetailsContent 
              recipient={recipient}
              emailType={email.email_type}
              emailStatus={email.status}
              templateName={email.template_name}
            />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <EmailDetailsData emailData={email.email_data} />
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4">
            <EmailDetailsTimeline 
              sentAt={email.sent_at}
              openedAt={email.opened_at}
              clickedAt={email.clicked_at}
              recipientEmail={recipient?.email}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
