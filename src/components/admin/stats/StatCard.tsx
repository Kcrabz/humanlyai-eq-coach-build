
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";

export interface StatCardProps {
  title: string;
  value: number;
  description: string;
  onClick: () => void;
}

export const StatCard = ({ title, value, description, onClick }: StatCardProps) => {
  return (
    <EnhancedCard 
      clickable 
      withHoverEffect 
      onClick={onClick}
      className="hover:shadow-md transition-all"
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </EnhancedCard>
  );
};
