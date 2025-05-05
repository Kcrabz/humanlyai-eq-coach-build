
import { FC } from 'react';
import TestimonialCard, { Testimonial } from './TestimonialCard';

interface TestimonialsSectionProps {
  maxTestimonials?: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "HumanlyAI has helped me become more aware of my emotions and how they affect my decisions. The personalized coaching is like having an EQ expert in my pocket.",
    name: "Sarah K.",
    archetype: "Reflector"
  },
  {
    quote: "As someone who's always rushing into action, my coach has taught me to pause and reflect before responding. It's changed how I approach both work and relationships.",
    name: "Michael T.", 
    archetype: "Activator"
  },
  {
    quote: "The daily prompts and exercises have transformed how I communicate with my team. I'm noticing patterns in my behavior I never saw before.",
    name: "Jessica R.",
    archetype: "Connector"
  },
  {
    quote: "I was skeptical at first, but the personalized insights have been spot on. It's like having a coach who really gets me.",
    name: "David L.",
    archetype: "Observer"
  }
];

const TestimonialsSection: FC<TestimonialsSectionProps> = ({ maxTestimonials = 2 }) => {
  // Limit the number of testimonials displayed based on the prop
  const displayedTestimonials = testimonials.slice(0, maxTestimonials);
  
  return (
    <section className="py-16 bg-humanly-gray-lightest">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">What Our Users Say</h2>
          <p className="text-muted-foreground mt-4">
            Join thousands of people improving their emotional intelligence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
