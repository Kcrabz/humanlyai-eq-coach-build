
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  useAnimationTiming, 
  AnimationSpeed, 
  EasingType 
} from "@/hooks/useAnimationTiming";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const AnimationTimingDemo = () => {
  const { 
    getDuration, 
    getEasing, 
    framerPresets, 
    createTransition 
  } = useAnimationTiming();
  
  const [speed, setSpeed] = useState<AnimationSpeed>("normal");
  const [easing, setEasing] = useState<EasingType>("ease-out");
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Toggle animation state
  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), getDuration(speed) + 50);
  };
  
  return (
    <div className="max-w-lg mx-auto p-6 space-y-8 bg-white rounded-xl shadow-sm">
      <div>
        <h2 className="text-xl font-semibold mb-4">Animation Timing Demo</h2>
        <p className="text-sm text-muted-foreground mb-6">
          This demo shows how the animation timing hook provides consistent animations
          across components.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Animation Speed</label>
          <Select value={speed} onValueChange={(val) => setSpeed(val as AnimationSpeed)}>
            <SelectTrigger>
              <SelectValue placeholder="Select speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fast">Fast</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="slow">Slow</SelectItem>
              <SelectItem value="very-slow">Very Slow</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Easing Function</label>
          <Select value={easing} onValueChange={(val) => setEasing(val as EasingType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select easing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ease-out">Ease Out</SelectItem>
              <SelectItem value="ease-in-out">Ease In Out</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3">CSS Transition</h3>
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 bg-humanly-teal rounded-lg"
              style={{
                transition: createTransition('transform', speed, easing),
                transform: isAnimating ? 'translateX(150px)' : 'translateX(0px)'
              }}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Framer Motion</h3>
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-humanly-indigo rounded-lg"
              animate={{ 
                x: isAnimating ? 150 : 0,
                rotate: isAnimating ? 180 : 0
              }}
              transition={{ 
                duration: getDuration(speed) / 1000,
                ease: getEasing(easing)
              }}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Preset Animations</h3>
          <div className="flex justify-center gap-4">
            <motion.div
              className="w-16 h-16 bg-humanly-pastel-lavender rounded-lg"
              initial={framerPresets.fadeIn.initial}
              animate={isAnimating ? framerPresets.fadeIn.animate : framerPresets.fadeIn.initial}
              transition={{
                ...framerPresets.fadeIn.transition,
                duration: getDuration(speed) / 1000
              }}
            />
            <motion.div
              className="w-16 h-16 bg-humanly-pastel-mint rounded-lg"
              initial={framerPresets.scaleIn.initial}
              animate={isAnimating ? framerPresets.scaleIn.animate : framerPresets.scaleIn.initial}
              transition={{
                ...framerPresets.scaleIn.transition,
                duration: getDuration(speed) / 1000
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button onClick={triggerAnimation} disabled={isAnimating}>
          {isAnimating ? "Animating..." : "Trigger Animation"}
        </Button>
      </div>
    </div>
  );
};
