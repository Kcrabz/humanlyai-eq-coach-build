
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmailDetailsDialog from "./email-details/EmailDetailsDialog";
import { SendEmailDialog } from "./send-email";
import EmailTemplatePreview from "./EmailTemplatePreview";
import { useEmailManagement } from "./hooks/useEmailManagement";
import { EmailFilters } from "./components/EmailFilters";
import { EmailActions } from "./components/EmailActions";
import { EmailList } from "./components/EmailList";

export default function EmailManagement() {
  const {
    filteredEmails,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    templateFilter,
    setTemplateFilter,
    dateRange,
    setDateRange,
    templates,
    users,
    activeTab,
    setActiveTab,
    loadEmails,
    resendEmail
  } = useEmailManagement();

  const [selectedEmail, setSelectedEmail] = useState(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Email Management</CardTitle>
              <CardDescription>Manage and monitor all system emails</CardDescription>
            </div>
            <EmailActions 
              onShowTemplatePreview={() => setShowTemplatePreview(true)}
              onShowSendDialog={() => setShowSendDialog(true)}
              onRefresh={loadEmails}
            />
          </div>
        </CardHeader>
        <CardContent>
          <EmailFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            templateFilter={templateFilter}
            setTemplateFilter={setTemplateFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            templates={templates}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <EmailList 
            loading={loading}
            filteredEmails={filteredEmails}
            onViewEmail={setSelectedEmail}
            onResendEmail={resendEmail}
          />
        </CardContent>
      </Card>

      {selectedEmail && (
        <EmailDetailsDialog
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          users={users}
        />
      )}

      {showSendDialog && (
        <SendEmailDialog
          onClose={() => setShowSendDialog(false)}
          users={users}
          templates={templates}
          onSendSuccess={loadEmails}
        />
      )}

      {showTemplatePreview && (
        <EmailTemplatePreview 
          open={showTemplatePreview}
          onClose={() => setShowTemplatePreview(false)}
        />
      )}
    </div>
  );
}
