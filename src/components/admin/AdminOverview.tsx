
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStats } from "@/hooks/useUserStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { SubscriptionTier } from "@/types";

export const AdminOverview = () => {
  const { stats, isLoading } = useUserStats();
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  // Colors for subscription tiers
  const COLORS = {
    free: "#10b981",
    basic: "#6366f1",
    premium: "#8b5cf6"
  };

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

  if (isLoading) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers || 0} description="All registered users" />
        <StatCard title="Onboarded Users" value={stats?.onboardedUsers || 0} description="Users who completed onboarding" />
        <StatCard title="Active Chats" value={stats?.chatUsers || 0} description="Users with chat activity" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Tiers</CardTitle>
            <CardDescription>Distribution of users by subscription tier</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name.toLowerCase() as SubscriptionTier] || "#777777"} 
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EQ Archetypes</CardTitle>
            <CardDescription>Distribution of users by EQ archetype</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, description }: { title: string; value: number; description: string }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
