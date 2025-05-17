
import { useState, useMemo } from "react";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { SubscriptionPieChart } from "./charts/SubscriptionPieChart";
import { ArchetypeBarChart } from "./charts/ArchetypeBarChart";
import { StatsOverview } from "./stats/StatsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserStats } from "@/hooks/useUserStats";
import { Loading } from "@/components/ui/loading";
import { FilterState } from "@/hooks/useUserManagement/types";
import { AlertCircle, User, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminOverviewProps {
  onFilterChange: (filter: FilterState) => void;
}

export const AdminOverview = ({ onFilterChange }: AdminOverviewProps) => {
  const { stats, isLoading } = useUserStats();
  const [chartsTab, setChartsTab] = useState("subscriptions");

  const handleFilterClick = (type: string, value: string) => {
    onFilterChange({ type, value });
  };

  // Memoize the subscription data transformation
  const subscriptionData = useMemo(() => {
    if (!stats?.tierCounts) return [];
    return Object.entries(stats.tierCounts).map(([name, value]) => ({ name, value }));
  }, [stats?.tierCounts]);

  // Memoize the archetype data transformation
  const archetypeData = useMemo(() => {
    if (!stats?.archetypeCounts) return [];
    return Object.entries(stats.archetypeCounts).map(([name, value]) => ({ name, value }));
  }, [stats?.archetypeCounts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsOverview 
        stats={stats}
        onFilterClick={handleFilterClick}
      />

      {/* Token Usage Information Card */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle>Token Usage Tracking</AlertTitle>
        <AlertDescription className="text-blue-700">
          Users' token consumption is now displayed in the User Management table. Token limits are:
          <ul className="list-disc ml-5 mt-2">
            <li>Free/Trial: 25,000 tokens per month</li>
            <li>Basic: 50,000 tokens per month</li>
            <li>Premium: 100,000 tokens per month</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <EnhancedCard>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" /> Subscription Tiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionPieChart 
              pieData={subscriptionData} 
              onPieElementClick={(tier) => handleFilterClick('tier', tier)}
            />
          </CardContent>
        </EnhancedCard>
        
        <EnhancedCard>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" /> Archetypes Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={chartsTab} onValueChange={setChartsTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="subscriptions">By Subscription</TabsTrigger>
                <TabsTrigger value="archetypes">By Archetype</TabsTrigger>
              </TabsList>
              
              <TabsContent value="subscriptions">
                <SubscriptionPieChart 
                  pieData={subscriptionData}
                  onPieElementClick={(tier) => handleFilterClick('tier', tier)}
                />
              </TabsContent>
              
              <TabsContent value="archetypes">
                <ArchetypeBarChart 
                  barData={archetypeData}
                  onBarElementClick={(archetype) => handleFilterClick('archetype', archetype)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};
