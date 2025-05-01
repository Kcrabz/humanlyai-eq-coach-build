
import { PageLayout } from "@/components/layout/PageLayout";
import { PricingCard } from "@/components/subscription/PricingCard";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PricingPage = () => {
  const { user, updateProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  
  const handleSelectPlan = (planId: string) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    
    setIsProcessing(true);
    
    // Mock subscription process - Would be replaced with Stripe checkout and Supabase edge function
    setTimeout(() => {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (plan) {
        updateProfile({ subscription_tier: plan.tier });
        toast.success(`Subscribed to ${plan.name} plan successfully!`);
        navigate("/chat");
      } else {
        toast.error("Failed to process subscription");
      }
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the subscription that fits your emotional intelligence growth journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan.id)}
              isCurrentPlan={user?.subscription_tier === plan.tier}
            />
          ))}
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg mb-2">How does the free trial work?</h3>
              <p className="text-muted-foreground">
                The free trial gives you 24 hours of full access to all premium features. No credit card required. At the end of the trial, you'll keep basic access but will need to upgrade for premium features.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg mb-2">Can I change my plan later?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings. Changes take effect at the end of your billing cycle.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg mb-2">What's the difference between Basic and Premium?</h3>
              <p className="text-muted-foreground">
                Basic gives you unlimited conversations with your EQ coach but without memory between sessions. Premium adds conversation memory, progress tracking, and advanced EQ challenges for a more personalized growth journey.
              </p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium text-lg mb-2">Can I get a refund?</h3>
              <p className="text-muted-foreground">
                We offer a 7-day money-back guarantee if you're not satisfied with your subscription. Contact our support team to process your refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PricingPage;
