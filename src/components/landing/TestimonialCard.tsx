
import { FC } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export interface Testimonial {
  quote: string;
  name: string;
  archetype: string;
  avatar?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: FC<TestimonialCardProps> = ({ testimonial }) => {
  const { quote, name, archetype, avatar } = testimonial;
  
  return (
    <Card className="h-full zen-hover border-humanly-pastel-lavender/30 relative overflow-hidden">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="absolute top-6 right-6 opacity-10 text-humanly-indigo text-6xl font-serif">
          "
        </div>
        <p className="text-muted-foreground mb-6 relative z-10 flex-grow">"{quote}"</p>
        <div className="flex items-center mt-auto">
          <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-humanly-pastel-lavender">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-humanly-purple/20 flex items-center justify-center text-humanly-purple font-medium">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <Badge variant="secondary" className="bg-humanly-indigo/10 text-humanly-indigo text-xs mt-1">
              {archetype} Archetype
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
