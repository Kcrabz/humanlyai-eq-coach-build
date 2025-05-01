
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ARCHETYPES } from "@/lib/constants";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/chat");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="blob bg-humanly-purple/20 w-[300px] h-[300px] top-[-100px] left-[-100px]" />
        <div className="blob bg-humanly-purple-light/20 w-[400px] h-[400px] bottom-[-200px] right-[-200px]" />
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-humanly-purple to-humanly-purple-light bg-clip-text text-transparent">
                HumanlyAI
              </span>
              <span className="block mt-2">Your AI EQ Coach</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Grow your emotional intelligence one daily conversation at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Start Coaching Now
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/pricing")}>
                View Plans
              </Button>
            </div>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-humanly-gray-lightest rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-humanly-purple/10 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="font-medium text-lg">Personalized coaching</h3>
                <p className="text-sm text-muted-foreground">
                  Tailored to your EQ archetype and preferred coaching style
                </p>
              </div>
              
              <div className="bg-humanly-gray-lightest rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-humanly-purple/10 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                </div>
                <h3 className="font-medium text-lg">Progress tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor your growth with challenges and achievements
                </p>
              </div>
              
              <div className="bg-humanly-gray-lightest rounded-lg p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-humanly-purple/10 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-humanly-purple">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="font-medium text-lg">Daily support</h3>
                <p className="text-sm text-muted-foreground">
                  No fluff. No therapy. Just real growth conversations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archetypes Section */}
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
            <Button onClick={handleGetStarted}>
              Find Your Archetype
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold">How HumanlyAI Works</h2>
            <p className="text-muted-foreground mt-4">
              Your journey to improved emotional intelligence in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-humanly-purple text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Discover Your Archetype</h3>
              <p className="text-muted-foreground">
                Complete a short onboarding to determine your EQ style and coaching preferences
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-humanly-purple text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Chat With Your Coach</h3>
              <p className="text-muted-foreground">
                Engage in daily conversations tailored to your emotional intelligence needs
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-humanly-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-humanly-purple text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Track Your Growth</h3>
              <p className="text-muted-foreground">
                Complete challenges and monitor your progress over time with detailed insights
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={handleGetStarted}>
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials (Placeholder) */}
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

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-humanly-purple to-humanly-purple-light text-white">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Grow Your EQ?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start your personalized coaching journey today with a free trial.
            No credit card required.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="bg-white text-humanly-purple hover:bg-humanly-gray-lightest"
            onClick={handleGetStarted}
          >
            Get Started Now
          </Button>
          <p className="mt-4 text-sm opacity-75">
            Join thousands of others improving their emotional intelligence
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
