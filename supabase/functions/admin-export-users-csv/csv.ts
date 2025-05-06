
import { UserData } from "./data.ts";

export function convertToCsv(userData: UserData[]): string {
  // Define the headers
  const headers = [
    'Email',
    'First Name',
    'Last Name',
    'Subscription Tier',
    'EQ Archetype',
    'Onboarded',
    'Created At',
    'Total Tokens Used'
  ];
  
  // Convert data to CSV format
  const csv = [
    headers.join(','),
    ...userData.map(user => [
      `"${user.email || ''}"`,
      `"${user.first_name || ''}"`,
      `"${user.last_name || ''}"`,
      `"${user.subscription_tier || ''}"`,
      `"${user.eq_archetype || ''}"`,
      `"${user.onboarded || ''}"`,
      `"${user.created_at || ''}"`,
      user.total_tokens_used
    ].join(','))
  ].join('\n');
  
  console.log("CSV format created with headers and data");
  
  return csv;
}
