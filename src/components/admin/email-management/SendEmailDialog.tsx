import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Generate email template data based on the selected template
  const generateTemplateData = () => {
    const baseData = { message: customMessage };
    
    switch(selectedTemplate) {
      case 'daily-nudge':
        return {
          ...baseData,
          challengeText: "Practice active listening in your next conversation. Focus entirely on understanding the speaker without planning your response while they're talking.",
          currentStreak: 5,
        };
      case 'weekly-summary':
        return {
          ...baseData,
          sessionsCompleted: 8,
          challengesCompleted: 5,
          breakthroughsCount: 2,
          personalisedInsight: "You're showing great progress in self-awareness. Try focusing on recognizing emotions in others this week.",
        };
      case 're-engagement':
        return {
          ...baseData,
          daysSinceLastLogin: 12,
          personalisedPrompt: "Emotional intelligence is like a muscle - regular practice leads to meaningful growth. Even a few minutes each day can make a significant difference.",
        };
      default:
        return baseData;
    }
  };

  // Generate a subject line based on the selected template
  const generateSubject = (template: string) => {
    switch(template) {
      case 'daily-nudge':
        return "Your Daily EQ Challenge";
      case 'weekly-summary':
        return "Your Weekly EQ Progress Report";
      case 're-engagement':
        return "We Miss You! Continue Your EQ Journey";
      default:
        return "Message from Humanly AI";
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (subject === "" || subject === generateSubject(selectedTemplate)) {
      setSubject(generateSubject(template));
    }
  };

  const sendEmails = async () => {
    if (!selectedTemplate || selectedUsers.length === 0 || !subject) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      setSending(true);
      toast.loading("Sending emails...", { id: "sending-emails" });

      const emailType = selectedTemplate.replace(/-/g, '_');
      const results = [];
      
      // Generate template-specific data
      const templateData = generateTemplateData();

      // Send emails to each selected user
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;

        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            userId: userId,
            emailType: emailType,
            templateName: selectedTemplate,
            subject: subject,
            to: user.email,
            data: {
              ...templateData,
              name: "User" // Default name if we don't have it
            }
          }
        });

        if (error) {
          console.error(`Error sending email to ${user.email}:`, error);
          results.push({ userId, email: user.email, success: false, error });
        } else {
          results.push({ userId, email: user.email, success: true });
        }
      }

      toast.dismiss("sending-emails");
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        toast.success(`Successfully sent ${successCount} email${successCount !== 1 ? 's' : ''}`);
      } else if (successCount === 0) {
        toast.error(`Failed to send all ${failCount} email${failCount !== 1 ? 's' : ''}`);
      } else {
        toast.warning(`Sent ${successCount} email${successCount !== 1 ? 's' : ''}, ${failCount} failed`);
      }

      onSendSuccess();
      onClose();
    } catch (error) {
      console.error("Error in sending emails:", error);
      toast.dismiss("sending-emails");
      toast.error("An error occurred while sending emails");
    } finally {
      setSending(false);
    }
  };

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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Select Recipients</label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="selectAll" 
                  checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="selectAll" className="text-xs font-medium">Select All</label>
              </div>
            </div>
            
            <Input
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            
            <div className="border rounded-md h-64 overflow-y-auto p-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 py-1 hover:bg-muted px-2 rounded-sm">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm flex-grow cursor-pointer">
                      {user.email}
                    </label>
                  </div>
                ))
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Selected {selectedUsers.length} of {users.length} users
            </div>
          </div>
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
