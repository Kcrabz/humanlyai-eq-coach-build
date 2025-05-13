
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type NavigationTab = {
  value: string;
  label: string;
  shortLabel?: string;
};

interface ProgressNavigationProps {
  tabs: NavigationTab[];
  activeTab: string;
  onChange: (value: string) => void;
}

export const ProgressNavigation: React.FC<ProgressNavigationProps> = ({
  tabs,
  activeTab,
  onChange
}) => {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className="pb-4">
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={(value) => {
            if (value) onChange(value);
          }}
          className="w-full rounded-lg border border-humanly-teal/20 p-1 bg-white/80 backdrop-blur-sm shadow-sm"
        >
          {tabs.map((tab) => (
            <ToggleGroupItem
              key={tab.value}
              value={tab.value}
              className="flex-1 text-xs md:text-sm font-medium data-[state=on]:bg-humanly-teal/10 data-[state=on]:text-humanly-teal data-[state=on]:shadow-sm transition-all duration-200"
              aria-label={tab.label}
            >
              {tab.shortLabel || tab.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <TabsList className="grid grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="transition-all duration-300 hover:bg-humanly-pastel-lavender/30"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};
