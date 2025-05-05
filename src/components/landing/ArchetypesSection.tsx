
import { Button } from "@/components/ui/button";
import { ARCHETYPES } from "@/lib/constants";

interface ArchetypesSectionProps {
  onFindArchetype: () => void;
}

const ArchetypesSection = ({ onFindArchetype }: ArchetypesSectionProps) => {
  return (
    <section className="py-16 bg-humanly-gray-lightest">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">Discover Your EQ Archetype</h2>
          <p className="text-muted-foreground mt-4">
            HumanlyAI personalizes your coaching experience based on your unique emotional intelligence style.
            Which archetype are you?
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(ARCHETYPES).slice(0, 3).map((archetype) => (
            <div key={archetype.type} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">{archetype.icon}</div>
              <h3 className="text-xl font-medium mb-2">{archetype.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {archetype.description}
              </p>
              <div>
                <span className="text-xs font-semibold uppercase text-humanly-purple">Strengths</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {archetype.strengths.map(strength => (
                    <span key={strength} className="px-2 py-1 bg-humanly-purple/10 text-humanly-purple text-xs rounded-full">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button onClick={onFindArchetype}>
            Find Your Archetype
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ArchetypesSection;
