
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { RecipientsSelector } from "./components/RecipientsSelector";
import { useSendEmail } from "./hooks/useSendEmail";

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
          <div>
            <label className="text-sm font-medium mb-1 block">Email Template</label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((template) => (
                  <SelectItem key={template} value={template}>
                    {template.replace(/-/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedTemplate === 'daily-nudge' && "Sends a daily EQ challenge to users"}
              {selectedTemplate === 'weekly-summary' && "Sends a weekly progress report with user's achievements"}
              {selectedTemplate === 're-engagement' && "Re-engages users who haven't logged in recently"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Subject</label>
            <Input
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Custom Message</label>
            <Textarea
              placeholder="Add a custom message to include in the email..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

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
