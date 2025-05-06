
// Avatar options using DiceBear's lorelei style
export const AVATAR_SEEDS = [
  // Quick selection options (first 6 will be shown on main UI)
  "Felix", "Aneka", "Milo", "Zoe", "Bailey", "Charlie",
  
  // Additional options for the dialog
  "Alex", "Morgan", "Jordan", "Casey", "Taylor", "Riley",
  "Quinn", "Avery", "Blake", "Dakota", "Hayden", "Reese",
  "Finley", "Skyler", "Rowan", "Parker", "Phoenix", "Sage",
  "Emerson", "Remy", "Kendall", "Cameron", "Kai", "Robin",
  "Jamie", "Jessie", "Harley", "Logan", "Ash", "Drew",
  "Winter", "Summer", "Autumn", "River", "Sky", "Ocean",
  "Storm", "Rain", "Sunny", "Dawn", "Dusk", "Nova"
];

export const generateAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}`;
};

