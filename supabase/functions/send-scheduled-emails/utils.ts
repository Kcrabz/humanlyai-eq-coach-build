
// Shared constants and utility functions

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to calculate days between dates
export function daysBetween(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

// Format date to YYYY-MM-DD format
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
