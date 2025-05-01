
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionPlan } from "@/types";

interface PricingCardProps {
  plan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
}

export function PricingCard({ plan, onSelect, isCurrentPlan = false }: PricingCardProps) {
  return (
    <Card 
      className={`overflow-hidden ${plan.popular ? "border-humanly-purple shadow-md" : ""} ${
        isCurrentPlan ? "bg-humanly-gray-lightest" : ""
      }`}
    >
      {plan.popular && (
        <div className="bg-humanly-purple text-white text-xs font-medium py-1 text-center">
          Most Popular
        </div>
      )}
      {isCurrentPlan && (
        <div className="bg-humanly-purple text-white text-xs font-medium py-1 text-center">
          Your Current Plan
        </div>
      )}
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-xl">{plan.name}</span>
          {plan.price > 0 && (
            <div className="flex items-baseline">
              <span className="text-2xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-humanly-purple mt-1"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={plan.popular ? "default" : "outline"}
          className="w-full"
          onClick={() => onSelect(plan)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Start Free Trial" : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
}
