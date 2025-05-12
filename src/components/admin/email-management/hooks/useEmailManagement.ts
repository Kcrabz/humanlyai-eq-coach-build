import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export interface EmailLog {
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

export interface User {
  id: string;
  email: string;
}

export const useEmailManagement = () => {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
  });
  const [templates, setTemplates] = useState<string[]>(['daily-nudge', 'weekly-summary', 're-engagement']);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadEmails();
    loadUsers();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    applyFilters();
  }, [emails, searchTerm, statusFilter, templateFilter, dateRange, activeTab]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) {
        throw error;
      }

      setEmails(data || []);
      
      // Extract unique templates for filtering
      const uniqueTemplates = Array.from(
        new Set(data?.map(item => item.template_name) || [])
      );
      
      // Make sure we always have our default templates in the list
      const defaultTemplates = ['daily-nudge', 'weekly-summary', 're-engagement'];
      const allTemplates = [...new Set([...uniqueTemplates, ...defaultTemplates])];
      
      setTemplates(allTemplates);
      
    } catch (error) {
      console.error("Error loading emails:", error);
      toast.error("Failed to load email logs");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: userEmails, error } = await supabase.functions.invoke('admin-get-user-emails');
      
      if (error) {
        throw error;
      }

      setUsers(userEmails || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

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

  const resendEmail = async (email: EmailLog) => {
    try {
      const recipient = users.find(user => user.id === email.user_id);
      
      if (!recipient) {
        toast.error("Recipient information not found");
        return;
      }

      toast.loading("Resending email...", { id: "resend-email" });

      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          userId: email.user_id,
          emailType: email.email_type,
          templateName: email.template_name,
          subject: `Resent: ${email.email_type.replace(/_/g, ' ')}`,
          to: recipient.email,
          data: email.email_data
        }
      });

      if (error) {
        throw error;
      }

      toast.dismiss("resend-email");
      toast.success("Email resent successfully");
      loadEmails(); // Refresh the list
    } catch (error) {
      console.error("Error resending email:", error);
      toast.dismiss("resend-email");
      toast.error("Failed to resend email");
    }
  };

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
