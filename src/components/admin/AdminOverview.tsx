
import { useState, useEffect } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { StatsOverview } from "./stats/StatsOverview";
import { SubscriptionPieChart } from "./charts/SubscriptionPieChart";
import { ArchetypeBarChart } from "./charts/ArchetypeBarChart";

interface AdminOverviewProps {
  onFilterChange: (filter: { type: string; value: string }) => void;
}

export const AdminOverview = ({ onFilterChange }: AdminOverviewProps) => {
  const { stats, isLoading } = useUserStats();
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  useEffect(() => {
    if (stats) {
      // Prepare data for pie chart
      const pieData = [
        { name: 'Free', value: stats.tierCounts.free || 0 },
        { name: 'Basic', value: stats.tierCounts.basic || 0 },
        { name: 'Premium', value: stats.tierCounts.premium || 0 },
      ].filter(item => item.value > 0);
      
      setPieData(pieData);

      // Prepare data for archetype bar chart
      const archetypeData = [
        { name: 'Reflector', value: stats.archetypeCounts.reflector || 0 },
        { name: 'Activator', value: stats.archetypeCounts.activator || 0 },
        { name: 'Regulator', value: stats.archetypeCounts.regulator || 0 },
        { name: 'Connector', value: stats.archetypeCounts.connector || 0 },
        { name: 'Observer', value: stats.archetypeCounts.observer || 0 },
        { name: 'Not Set', value: stats.archetypeCounts['Not set'] || 0 },
      ].filter(item => item.value > 0);
      
      setBarData(archetypeData);
    }
  }, [stats]);

  // Handle click on a pie chart element
  const handlePieElementClick = (name: string) => {
    if (name) {
      handleStatClick("tier", name.toLowerCase());
    }
  };

  // Handle click on a bar chart element
  const handleBarElementClick = (name: string) => {
    if (name) {
      handleStatClick("archetype", name === "Not Set" ? "not-set" : name.toLowerCase());
    }
  };

  // Handle click on a stat card
  const handleStatClick = (filterType: string, filterValue: string) => {
    onFilterChange({ type: filterType, value: filterValue });
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <StatsOverview onFilterChange={onFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Pie Chart */}
        <SubscriptionPieChart 
          pieData={pieData} 
          onPieElementClick={handlePieElementClick} 
        />

        {/* Archetype Bar Chart */}
        <ArchetypeBarChart 
          barData={barData} 
          onBarElementClick={handleBarElementClick} 
        />
      </div>
    </div>
  );
};
