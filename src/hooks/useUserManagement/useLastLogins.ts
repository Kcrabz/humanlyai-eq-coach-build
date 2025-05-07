
import { supabase } from "@/integrations/supabase/client";

// Define a type for the user data from admin.listUsers()
interface AdminUser {
  id?: string;
  email?: string;
  last_sign_in_at?: string;
  [key: string]: any; // Allow for other properties
}

export const useLastLogins = () => {
  // Fetch last login time for users
  const fetchLastLogins = async (): Promise<Map<string, string>> => {
    try {
      // For each user, we'll get the latest auth session
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error("Error fetching user sessions:", error);
        throw error;
      }
      
      const loginMap = new Map<string, string>();
      
      // Format the last sign in time
      if (data && data.users) {
        data.users.forEach((user: AdminUser) => {
          if (user && user.last_sign_in_at) {
            const lastLogin = new Date(user.last_sign_in_at);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
            
            let formatted = '';
            if (diffDays === 0) {
              formatted = 'Today';
            } else if (diffDays === 1) {
              formatted = 'Yesterday';
            } else if (diffDays < 7) {
              formatted = `${diffDays} days ago`;
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7);
              formatted = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
              formatted = lastLogin.toLocaleDateString();
            }
            
            if (user.id) {
              loginMap.set(user.id, formatted);
            }
          }
        });
      }
      
      return loginMap;
    } catch (error) {
      console.error("Failed to fetch last logins:", error);
      return new Map();
    }
  };

  return { fetchLastLogins };
};
