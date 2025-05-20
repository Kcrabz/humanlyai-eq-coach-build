import { useState, useEffect } from "react";
import { EmailLog, EmailFilterState } from "./types";

export const useEmailFiltering = (emails: EmailLog[]) => {
  const [filteredEmails, setFilteredEmails] = useState<EmailLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
  });
  const [activeTab, setActiveTab] = useState("all");

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [emails, searchTerm, statusFilter, templateFilter, dateRange, activeTab]);

  const applyFilters = () => {
    let filtered = [...emails];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(email => 
        email.email_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (email.email_data && JSON.stringify(email.email_data).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(email => email.status === statusFilter);
    }

    // Apply template filter
    if (templateFilter !== "all") {
      filtered = filtered.filter(email => email.template_name === templateFilter);
    }

    // Apply date range filter
    if (dateRange.from) {
      filtered = filtered.filter(email => {
        const emailDate = new Date(email.sent_at);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        // If there's an end date, filter between the two
        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return emailDate >= fromDate && emailDate <= toDate;
        }
        
        // Otherwise just filter for emails after the from date
        return emailDate >= fromDate;
      });
    }

    // Apply tab filter
    if (activeTab === "opened") {
      filtered = filtered.filter(email => email.opened_at !== null);
    } else if (activeTab === "clicked") {
      filtered = filtered.filter(email => email.clicked_at !== null);
    } else if (activeTab === "failed") {
      filtered = filtered.filter(email => email.status === "failed");
    }

    setFilteredEmails(filtered);
  };

  return {
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
  };
};
