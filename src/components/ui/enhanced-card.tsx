
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./card";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  clickable?: boolean;
  active?: boolean;
  children: React.ReactNode;
  contentClassName?: string;
  withHoverEffect?: boolean;
}

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, clickable, active, children, contentClassName, withHoverEffect = true, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "bg-white border border-gray-100",
          withHoverEffect && "transition-all duration-300",
          withHoverEffect && "hover:shadow-md",
          clickable && "cursor-pointer",
          withHoverEffect && clickable && "hover:-translate-y-0.5",
          active && "bg-gradient-to-br from-white to-humanly-pastel-lavender/20 border-humanly-indigo/10",
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

export const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardContent>
>(({ className, ...props }, ref) => (
  <CardContent 
    ref={ref} 
    className={cn("p-4", className)} 
    {...props} 
  />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

export const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardHeader> & { 
    showBorder?: boolean 
  }
>(({ className, showBorder, ...props }, ref) => (
  <CardHeader 
    ref={ref} 
    className={cn(
      "p-4 pb-2", 
      showBorder && "border-b border-gray-100", 
      className
    )} 
    {...props} 
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

export const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CardFooter> & { 
    showBorder?: boolean 
  }
>(({ className, showBorder, ...props }, ref) => (
  <CardFooter 
    ref={ref} 
    className={cn(
      "p-4 pt-2", 
      showBorder && "border-t border-gray-100", 
      className
    )} 
    {...props} 
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";
