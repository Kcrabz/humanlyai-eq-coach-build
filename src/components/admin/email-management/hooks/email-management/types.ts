
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

export interface EmailFilterState {
  searchTerm: string;
  statusFilter: string;
  templateFilter: string;
  dateRange: { from: Date; to?: Date };
  activeTab: string;
}
