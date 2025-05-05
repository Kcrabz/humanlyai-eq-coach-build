
const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-humanly-gray-lightest">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold">What Our Users Say</h2>
          <p className="text-muted-foreground mt-4">
            Join thousands of people improving their emotional intelligence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="italic text-muted-foreground mb-4">
              "HumanlyAI has helped me become more aware of my emotions and how they affect my decisions. The personalized coaching is like having an EQ expert in my pocket."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-humanly-purple/20 rounded-full mr-3"></div>
              <div>
                <p className="font-medium">Sarah K.</p>
                <p className="text-xs text-muted-foreground">Reflector Archetype</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="italic text-muted-foreground mb-4">
              "As someone who's always rushing into action, my coach has taught me to pause and reflect before responding. It's changed how I approach both work and relationships."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-humanly-purple/20 rounded-full mr-3"></div>
              <div>
                <p className="font-medium">Michael T.</p>
                <p className="text-xs text-muted-foreground">Activator Archetype</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
