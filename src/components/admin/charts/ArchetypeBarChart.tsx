
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ArchetypeBarChartProps {
  barData: Array<{ name: string; value: number }>;
  onBarElementClick: (name: string) => void;
}

export const ArchetypeBarChart = ({ barData, onBarElementClick }: ArchetypeBarChartProps) => {
  // Handle click on bar chart element
  const handleBarChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const name = data.activePayload[0].payload.name;
      onBarElementClick(name);
    }
  };

  return (
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
            onClick={handleBarChartClick}
          >
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="name" 
              onClick={(name) => onBarElementClick(name as string)}
              cursor="pointer"
            />
            <Tooltip />
            <Bar 
              dataKey="value" 
              fill="#8884d8" 
              cursor="pointer"
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center mt-4 gap-2">
          {barData.map(item => (
            <Button 
              key={item.name}
              variant="outline"
              className="text-xs"
              onClick={() => onBarElementClick(item.name)}
            >
              {item.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
