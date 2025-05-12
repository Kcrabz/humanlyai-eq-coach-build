import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Send, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import EmailDetailsDialog from "./EmailDetailsDialog";
import SendEmailDialog from "./SendEmailDialog";
import { Badge } from "@/components/ui/badge";

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

export default function EmailManagement() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) });
  const [templates, setTemplates] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
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
      setTemplates(uniqueTemplates);
      
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500">Sent</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500">Delivered</Badge>;
      case 'opened':
        return <Badge className="bg-purple-500">Opened</Badge>;
      case 'clicked':
        return <Badge className="bg-yellow-500">Clicked</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const formatEmailType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Email Management</CardTitle>
              <CardDescription>Manage and monitor all system emails</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowSendDialog(true)} className="flex items-center">
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button variant="outline" onClick={loadEmails} className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All Emails</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="opened">Opened</TabsTrigger>
              <TabsTrigger value="clicked">Clicked</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="w-[200px]">
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template.replace(/-/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[300px]">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No emails found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell>{formatEmailType(email.email_type)}</TableCell>
                        <TableCell>{email.template_name.replace(/-/g, ' ')}</TableCell>
                        <TableCell>{getStatusBadge(email.status)}</TableCell>
                        <TableCell>{format(new Date(email.sent_at), 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEmail(email)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendEmail(email)}
                            >
                              Resend
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
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
    </div>
  );
}
