
import React from 'react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { EmailLog } from '../hooks/useEmailManagement';

interface EmailListProps {
  loading: boolean;
  filteredEmails: EmailLog[];
  onViewEmail: (email: EmailLog) => void;
  onResendEmail: (email: EmailLog) => void;
}

export const EmailList: React.FC<EmailListProps> = ({
  loading,
  filteredEmails,
  onViewEmail,
  onResendEmail
}) => {
  const formatEmailType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
                      onClick={() => onViewEmail(email)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResendEmail(email)}
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
  );
};
