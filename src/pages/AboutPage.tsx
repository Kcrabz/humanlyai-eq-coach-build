
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        <div className="space-y-4 mb-10">
          <h1 className="text-4xl font-bold">About HumanlyAI</h1>
          <p className="text-xl text-muted-foreground">
            Emotional Intelligence coaching for everyone
          </p>
        </div>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-4">
            At HumanlyAI, we believe that emotional intelligence is a critical skill that everyone should develop. Our mission is to make personalized EQ coaching accessible to all through innovative AI technology.
          </p>
          <p className="text-lg mb-4">
            We've designed our platform to provide practical, actionable coaching that helps you understand yourself and others better, regulate your emotions, and improve your relationships and decision-making.
          </p>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">The Science Behind HumanlyAI</h2>
          <p className="text-lg mb-4">
            Our approach is based on established frameworks in emotional intelligence research. We've worked with EQ experts to develop our unique archetype system, which helps personalize your coaching experience.
          </p>
          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="bg-humanly-gray-lightest p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Research-Backed</h3>
              <p className="text-muted-foreground">
                Our coaching methodology is grounded in decades of research on emotional intelligence and personal development.
              </p>
            </div>
            <div className="bg-humanly-gray-lightest p-6 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Personalized Growth</h3>
              <p className="text-muted-foreground">
                We use your archetype and preferences to tailor coaching that addresses your specific EQ needs.
              </p>
            </div>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">How It's Different</h2>
          <p className="text-lg mb-4">
            HumanlyAI isn't therapy or general self-help. We focus specifically on developing emotional intelligence skills through practical coaching conversations and challenges.
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li className="text-lg">
              <span className="font-medium">Not therapy</span>: We don't diagnose or treat mental health conditions. We focus on skill development.
            </li>
            <li className="text-lg">
              <span className="font-medium">Action-oriented</span>: Every conversation includes concrete actions you can take to improve your EQ.
            </li>
            <li className="text-lg">
              <span className="font-medium">Accessible format</span>: Short, focused coaching conversations that fit into your busy life.
            </li>
            <li className="text-lg">
              <span className="font-medium">Personalized approach</span>: Coaching that adapts to your unique emotional intelligence style.
            </li>
          </ul>
        </section>
        
        <div className="bg-humanly-gray-lightest p-8 rounded-lg text-center">
          <h2 className="text-2xl font-semibold mb-3">Ready to grow your emotional intelligence?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Start your free trial today and discover your EQ archetype
          </p>
          <Link to="/signup">
            <Button size="lg">Get Started Now</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
