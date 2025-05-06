
import { useState, useEffect } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { StatCard } from "./StatCard";

interface StatsOverviewProps {
  onFilterChange: (filter: { type: string; value: string }) => void;
}

export const StatsOverview = ({ onFilterChange }: StatsOverviewProps) => {
  const { stats, isLoading } = useUserStats();

  // Handle click on a stat card
  const handleStatClick = (filterType: string, filterValue: string) => {
    onFilterChange({ type: filterType, value: filterValue });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading statistics...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Total Users" 
        value={stats?.totalUsers || 0} 
        description="All registered users" 
        onClick={() => handleStatClick("all", "")}
      />
      <StatCard 
        title="Onboarded Users" 
        value={stats?.onboardedUsers || 0} 
        description="Users who completed onboarding" 
        onClick={() => handleStatClick("onboarded", "true")}
      />
      <StatCard 
        title="Active Chats" 
        value={stats?.chatUsers || 0} 
        description="Users with chat activity" 
        onClick={() => handleStatClick("chat", "true")}
      />
    </div>
  );
};
