
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailLog, User } from "./types";

export const useEmailLoading = () => {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<string[]>(['daily-nudge', 'weekly-summary', 're-engagement']);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadEmails();
    loadUsers();
  }, []);

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

  return {
    emails,
    loading,
    templates,
    users,
    loadEmails
  };
};
