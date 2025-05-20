
import { useEmailLoading } from "./useEmailLoading";
import { useEmailFiltering } from "./useEmailFiltering";
import { useEmailActions } from "./useEmailActions";
import { EmailLog, User, EmailFilterState } from "./types";

export const useEmailManagement = () => {
  const { emails, loading, templates, users, loadEmails } = useEmailLoading();
  
  const {
    filteredEmails,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    templateFilter,
    setTemplateFilter,
    dateRange,
    setDateRange,
    activeTab,
    setActiveTab
  } = useEmailFiltering(emails);
  
  const { resendEmail } = useEmailActions(users, loadEmails);

  return {
    emails,
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
  };
};

export type { EmailLog, User, EmailFilterState };
