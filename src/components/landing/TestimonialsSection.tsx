
import { FC } from 'react';
import TestimonialCard, { Testimonial } from './TestimonialCard';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

interface TestimonialsSectionProps {
  maxTestimonials?: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "HumanlyAI has helped me become more aware of my emotions and how they affect my decisions. The personalized coaching is like having an EQ expert in my pocket.",
    name: "Sarah K.",
    archetype: "Reflector",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    quote: "As someone who's always rushing into action, my coach has taught me to pause and reflect before responding. It's changed how I approach both work and relationships.",
    name: "Michael T.", 
    archetype: "Activator",
    avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    quote: "The daily prompts and exercises have transformed how I communicate with my team. I'm noticing patterns in my behavior I never saw before.",
    name: "Jessica R.",
    archetype: "Connector",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    quote: "I was skeptical at first, but the personalized insights have been spot on. It's like having a coach who really gets me.",
    name: "David L.",
    archetype: "Observer",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    quote: "Learning to regulate my emotions has made me a better leader. My team actually commented on how much calmer I am during stressful situations.",
    name: "Emma J.",
    archetype: "Regulator",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    quote: "The insights about my observation patterns have helped me become more present in conversations instead of just analyzing everything.",
    name: "Thomas R.",
    archetype: "Observer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop"
  },
  {
    quote: "I've been able to connect with my team on a much deeper level. The coaching has helped me understand different emotional styles.",
    name: "Priya S.",
    archetype: "Connector",
    avatar: "https://images.unsplash.com/photo-1619946794135-5bc917a27793?q=80&w=100&h=100&auto=format&fit=crop"
  }
];

const TestimonialsSection: FC<TestimonialsSectionProps> = ({ maxTestimonials = 3 }) => {
  // Limit the number of testimonials displayed based on the prop
  const displayedTestimonials = testimonials.slice(0, maxTestimonials);
  
  return (
    <section className="py-20 bg-humanly-gray-lightest">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-humanly-indigo/10 text-humanly-indigo text-sm font-medium mb-4">
            Real Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of people improving their emotional intelligence
          </p>
        </div>
        
        {/* For desktop - show grid of testimonials */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
        
        {/* For mobile - show carousel */}
        <div className="md:hidden max-w-md mx-auto">
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-4">
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static transform-none mx-2" />
              <CarouselNext className="static transform-none mx-2" />
            </div>
          </Carousel>
        </div>
        
        {/* View more testimonials section */}
        <div className="text-center mt-10">
          <Button variant="outline" className="border-humanly-indigo/30 text-humanly-indigo hover:bg-humanly-indigo/5">
            View More Stories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
