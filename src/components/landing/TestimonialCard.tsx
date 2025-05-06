
import { FC } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
        <div className="absolute top-6 right-6 opacity-10 text-humanly-indigo text-7xl font-serif">
          "
        </div>
        <p className="text-muted-foreground mb-6 relative z-10 flex-grow leading-relaxed">"{quote}"</p>
        <div className="flex items-center mt-auto">
          <Avatar className="h-12 w-12 mr-3 border-2 border-humanly-pastel-lavender">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback className="bg-humanly-purple/20 text-humanly-purple font-medium">
                {name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <Badge 
              variant="secondary" 
              className="bg-humanly-indigo/10 text-humanly-indigo text-xs mt-1 hover:bg-humanly-indigo/20"
            >
              {archetype} Archetype
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
