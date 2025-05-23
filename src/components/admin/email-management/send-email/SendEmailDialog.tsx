
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
import { Loader2 } from "lucide-react";

import { EmailTemplateSelector } from "./EmailTemplateSelector";
import { EmailSubject } from "./EmailSubject";
import { EmailCustomMessage } from "./EmailCustomMessage";
import { RecipientsSelector } from "../components/RecipientsSelector";
import { useSendEmail } from "../hooks/useSendEmail";

interface User {
  id: string;
  email: string;
}

interface SendEmailDialogProps {
  onClose: () => void;
  users: User[];
  templates: string[];
  onSendSuccess: () => void;
}

export default function SendEmailDialog({
  onClose,
  users,
  templates,
  onSendSuccess,
}: SendEmailDialogProps) {
  // Define default available templates if none are provided
  const availableTemplates = templates.length > 0 
    ? templates 
    : ['daily-nudge', 'weekly-summary', 're-engagement'];
  
  const {
    selectedTemplate,
    selectedUsers,
    subject,
    customMessage,
    sending,
    searchTerm,
    filteredUsers,
    handleUserToggle,
    handleSelectAll,
    handleTemplateChange,
    setSubject,
    setCustomMessage,
    setSearchTerm,
    sendEmails
  } = useSendEmail(users, onSendSuccess, onClose);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Send emails to selected users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <EmailTemplateSelector
            selectedTemplate={selectedTemplate}
            handleTemplateChange={handleTemplateChange}
            availableTemplates={availableTemplates}
          />

          <EmailSubject
            subject={subject}
            setSubject={setSubject}
          />

          <EmailCustomMessage
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
          />

          <RecipientsSelector 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredUsers={filteredUsers}
            selectedUsers={selectedUsers}
            handleUserToggle={handleUserToggle}
            handleSelectAll={handleSelectAll}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={sendEmails} disabled={sending || selectedUsers.length === 0 || !selectedTemplate}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              `Send to ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
