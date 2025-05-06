
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArchetypesSectionProps {
  onFindArchetype: () => void;
}

const ArchetypesSection = ({ onFindArchetype }: ArchetypesSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-humanly-gray-lightest/70">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Your EQ Archetype</h2>
          <p className="text-muted-foreground text-lg">
            HumanlyAI personalizes your coaching experience based on your unique emotional intelligence style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 max-w-7xl mx-auto">
          {Object.values(ARCHETYPES).map((archetype, index) => (
            <Card 
              key={archetype.type} 
              className="zen-hover border-humanly-pastel-lavender/30 shadow-soft overflow-hidden h-full"
            >
              <div className={`h-2 w-full ${
                index === 0 ? "bg-humanly-indigo" : 
                index === 1 ? "bg-humanly-teal" : 
                index === 2 ? "bg-humanly-pastel-rose" :
                index === 3 ? "bg-humanly-pastel-peach" :
                "bg-humanly-pastel-mint"
              }`}></div>
              <CardContent className="p-6">
                <div className="text-3xl mb-4">{archetype.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{archetype.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 min-h-[80px]">
                  {archetype.description}
                </p>
                <div>
                  <span className="text-xs font-semibold uppercase text-humanly-indigo mb-2 block">
                    Strengths
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {archetype.strengths.slice(0, 3).map(strength => (
                      <Badge key={strength} variant="secondary" className="bg-humanly-indigo/10 text-humanly-indigo hover:bg-humanly-indigo/20">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            onClick={onFindArchetype} 
            className="zen-hover group"
            size="lg"
          >
            Find Your Archetype
          </Button>
          <p className="text-muted-foreground mt-4 text-sm">
            Takes only 3 minutes • Personalized to your unique style
          </p>
        </div>
      </div>
    </section>
  );
};

export default ArchetypesSection;
