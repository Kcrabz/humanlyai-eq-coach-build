
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmailTemplateSelectorProps {
  selectedTemplate: string;
  handleTemplateChange: (template: string) => void;
  availableTemplates: string[];
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  selectedTemplate,
  handleTemplateChange,
  availableTemplates
}) => {
  return (
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
  );
};
