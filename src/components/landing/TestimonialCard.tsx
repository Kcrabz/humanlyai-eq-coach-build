
import { FC } from 'react';

export interface Testimonial {
  quote: string;
  name: string;
  archetype: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: FC<TestimonialCardProps> = ({ testimonial }) => {
  const { quote, name, archetype } = testimonial;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <p className="italic text-muted-foreground mb-4">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-humanly-purple/20 rounded-full mr-3"></div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{archetype} Archetype</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
