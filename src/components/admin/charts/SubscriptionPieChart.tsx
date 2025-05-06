
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubscriptionTier } from "@/types";

interface SubscriptionPieChartProps {
  pieData: Array<{ name: string; value: number }>;
  onPieElementClick: (name: string) => void;
}

export const SubscriptionPieChart = ({ pieData, onPieElementClick }: SubscriptionPieChartProps) => {
  // Colors for subscription tiers
  const COLORS = {
    free: "#10b981",
    basic: "#6366f1",
    premium: "#8b5cf6"
  };

  return (
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
              onClick={(data) => onPieElementClick(data.name)}
              cursor="pointer"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || "#777777"} 
                />
              ))}
            </Pie>
            <Legend 
              onClick={(entry) => onPieElementClick(entry.value)}
              cursor="pointer"
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4 gap-2">
          {Object.entries(COLORS).map(([tier, color]) => (
            <Button 
              key={tier}
              variant="outline"
              className="text-xs"
              style={{ borderColor: color }}
              onClick={() => onPieElementClick(tier)}
            >
              <div className="w-3 h-3 mr-1 rounded-sm" style={{ backgroundColor: color }}></div>
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Users
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
