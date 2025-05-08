
// Mock progress data for the user progress page
export const MOCK_ACHIEVEMENTS = [
  { id: 1, name: "First Conversation", description: "Complete your first chat with your EQ coach", date: "2025-04-28", icon: "MessageCircle" },
  { id: 2, name: "Consistent Practice", description: "Chat with your coach for 3 days in a row", date: "2025-05-01", icon: "Calendar" },
  { id: 3, name: "Self Reflection", description: "Complete your first self-reflection exercise", date: "2025-05-03", icon: "Star" },
  { id: 4, name: "Active Listener", description: "Practice active listening skills in conversation", date: "2025-05-04", icon: "Award" },
];

export const MOCK_CHALLENGE_HISTORY = [
  { id: 1, title: "Express appreciation", completed: true, date: "2025-05-01" },
  { id: 2, name: "Notice emotional patterns", completed: true, date: "2025-05-03" },
  { id: 3, name: "Set a boundary today", completed: true, date: "2025-05-04" },
  { id: 4, name: "Practice patience", completed: true, date: "2025-05-05" },
  { id: 5, name: "Embrace uncertainty", completed: false, date: "2025-05-06" },
];

export const MOCK_TIMELINE_ITEMS = [
  {
    date: "April 28, 2025",
    title: "Started Your EQ Journey",
    description: "You completed your EQ assessment and discovered your archetype.",
    icon: "Calendar"
  },
  {
    date: "May 1, 2025",
    title: "First Week Streak",
    description: "You've been consistent with your EQ practice for 7 days.",
    icon: "MessageCircle"
  },
  {
    date: "May 4, 2025",
    title: "Self-Reflection Master",
    description: "You've completed 5 self-reflection exercises.",
    icon: "Award"
  },
  {
    date: "Current Focus",
    title: "Building Emotional Awareness",
    description: "Your current growth focus is on recognizing emotional patterns.",
    icon: "Flag",
    isCurrent: true,
    progress: 45
  }
];
