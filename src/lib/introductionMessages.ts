
import { CoachingMode } from "@/types";

// Introduction messages for different coaching modes
export const introductionMessages = {
  normal: `Hey there — I'm Kai, your HumanlyAI coach.

I'm here to help you grow your Emotional Intelligence one honest conversation at a time. We'll explore things like self-awareness, communication, and how to understand your emotions without being ruled by them.

This isn't therapy or fluff — this is a space to reflect, grow, and feel more like yourself, day by day.

You can check in anytime, share what's on your mind, ask for a daily EQ tip, or just explore your archetype. I'll be here to guide, nudge, and celebrate your progress along the way.

So, where do you want to start today?`,

  tough: `Alright, let's skip the fluff — I'm Kai. I'm not here to coddle you, I'm here to challenge you.

My job? To help you stop running from your blind spots and start leveling up your Emotional Intelligence — the real kind that builds better relationships, clearer decisions, and a stronger sense of self.

Expect honesty. Expect growth. And expect to get called out — with care.

So, what are you pretending *not* to know about yourself right now?`
};

// Helper function to get the appropriate introduction message
export const getIntroductionMessage = (coachingMode: CoachingMode | undefined): string => {
  // Default to normal mode if coaching mode is not set
  if (!coachingMode || coachingMode === 'normal') {
    return introductionMessages.normal;
  } else {
    return introductionMessages.tough;
  }
};

// Check if we should show the introduction (first-time user)
export const shouldShowIntroduction = (userId: string): boolean => {
  const key = `humanly_intro_shown_${userId}`;
  return localStorage.getItem(key) !== 'true';
};

// Mark that the introduction has been shown
export const markIntroductionAsShown = (userId: string): void => {
  const key = `humanly_intro_shown_${userId}`;
  localStorage.setItem(key, 'true');
};
