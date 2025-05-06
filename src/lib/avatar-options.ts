
// Avatar type definition with features for better searching/filtering
export type AvatarFeatures = {
  gender?: 'male' | 'female' | 'neutral';
  accessories?: ('glasses' | 'beard' | 'hat' | 'none')[];
  style?: 'professional' | 'casual' | 'colorful';
};

export type AvatarOption = {
  seed: string;
  features: AvatarFeatures;
};

// Avatar options using DiceBear's lorelei style with searchable features
export const AVATAR_OPTIONS: AvatarOption[] = [
  // Quick selection options (first 6 will be shown on main UI)
  { seed: "Felix", features: { gender: 'male', accessories: ['beard'], style: 'casual' } },
  { seed: "Aneka", features: { gender: 'female', accessories: ['none'], style: 'professional' } },
  { seed: "Milo", features: { gender: 'male', accessories: ['glasses'], style: 'casual' } },
  { seed: "Zoe", features: { gender: 'female', accessories: ['glasses'], style: 'professional' } },
  { seed: "Bailey", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Charlie", features: { gender: 'male', accessories: ['beard', 'glasses'], style: 'professional' } },
  
  // Additional options for the dialog
  { seed: "Alex", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Morgan", features: { gender: 'neutral', accessories: ['glasses'], style: 'professional' } },
  { seed: "Jordan", features: { gender: 'neutral', accessories: ['hat'], style: 'casual' } },
  { seed: "Casey", features: { gender: 'neutral', accessories: ['glasses'], style: 'casual' } },
  { seed: "Taylor", features: { gender: 'female', accessories: ['none'], style: 'professional' } },
  { seed: "Riley", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Quinn", features: { gender: 'neutral', accessories: ['glasses'], style: 'professional' } },
  { seed: "Avery", features: { gender: 'female', accessories: ['none'], style: 'casual' } },
  { seed: "Blake", features: { gender: 'male', accessories: ['beard'], style: 'professional' } },
  { seed: "Dakota", features: { gender: 'neutral', accessories: ['glasses'], style: 'casual' } },
  { seed: "Hayden", features: { gender: 'male', accessories: ['none'], style: 'casual' } },
  { seed: "Reese", features: { gender: 'neutral', accessories: ['glasses'], style: 'professional' } },
  { seed: "Finley", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Skyler", features: { gender: 'female', accessories: ['glasses'], style: 'casual' } },
  { seed: "Rowan", features: { gender: 'male', accessories: ['beard', 'glasses'], style: 'professional' } },
  { seed: "Parker", features: { gender: 'male', accessories: ['none'], style: 'casual' } },
  { seed: "Phoenix", features: { gender: 'neutral', accessories: ['glasses'], style: 'colorful' } },
  { seed: "Sage", features: { gender: 'female', accessories: ['none'], style: 'professional' } },
  { seed: "Emerson", features: { gender: 'male', accessories: ['beard'], style: 'casual' } },
  { seed: "Remy", features: { gender: 'male', accessories: ['glasses'], style: 'professional' } },
  { seed: "Kendall", features: { gender: 'female', accessories: ['none'], style: 'casual' } },
  { seed: "Cameron", features: { gender: 'male', accessories: ['beard'], style: 'professional' } },
  { seed: "Kai", features: { gender: 'male', accessories: ['none'], style: 'casual' } },
  { seed: "Robin", features: { gender: 'neutral', accessories: ['glasses'], style: 'professional' } },
  { seed: "Jamie", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Jessie", features: { gender: 'female', accessories: ['glasses'], style: 'casual' } },
  { seed: "Harley", features: { gender: 'neutral', accessories: ['none'], style: 'colorful' } },
  { seed: "Logan", features: { gender: 'male', accessories: ['beard', 'glasses'], style: 'professional' } },
  { seed: "Ash", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Drew", features: { gender: 'male', accessories: ['beard'], style: 'casual' } },
  { seed: "Winter", features: { gender: 'female', accessories: ['none'], style: 'professional' } },
  { seed: "Summer", features: { gender: 'female', accessories: ['glasses'], style: 'colorful' } },
  { seed: "Autumn", features: { gender: 'female', accessories: ['none'], style: 'casual' } },
  { seed: "River", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Sky", features: { gender: 'neutral', accessories: ['glasses'], style: 'colorful' } },
  { seed: "Ocean", features: { gender: 'neutral', accessories: ['none'], style: 'colorful' } },
  { seed: "Storm", features: { gender: 'neutral', accessories: ['glasses'], style: 'professional' } },
  { seed: "Rain", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Sunny", features: { gender: 'female', accessories: ['none'], style: 'colorful' } },
  { seed: "Dawn", features: { gender: 'female', accessories: ['glasses'], style: 'professional' } },
  { seed: "Dusk", features: { gender: 'neutral', accessories: ['none'], style: 'casual' } },
  { seed: "Nova", features: { gender: 'female', accessories: ['glasses'], style: 'colorful' } }
];

// Helper function to get just the seed names for backward compatibility
export const AVATAR_SEEDS = AVATAR_OPTIONS.map(option => option.seed);

// Generate avatar URL with the seed
export const generateAvatarUrl = (seed: string): string => {
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(seed)}`;
};

// Filter avatars based on search term and feature filters
export const filterAvatars = (
  avatars: AvatarOption[],
  searchTerm: string,
  filters: {
    gender?: string,
    accessories?: string[],
    style?: string
  } = {}
): AvatarOption[] => {
  return avatars.filter(avatar => {
    // Text search on seed name
    const matchesText = searchTerm === '' || 
      avatar.seed.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Feature filters
    const matchesGender = !filters.gender || 
      avatar.features.gender === filters.gender;
    
    const matchesAccessories = !filters.accessories?.length || 
      filters.accessories.some(acc => avatar.features.accessories?.includes(acc as any));
    
    const matchesStyle = !filters.style || 
      avatar.features.style === filters.style;
    
    return matchesText && matchesGender && matchesAccessories && matchesStyle;
  });
};

// Extract unique feature values for filter options
export const getFeatureOptions = () => {
  const genders = new Set<string>();
  const accessories = new Set<string>();
  const styles = new Set<string>();

  AVATAR_OPTIONS.forEach(avatar => {
    if (avatar.features.gender) genders.add(avatar.features.gender);
    avatar.features.accessories?.forEach(acc => accessories.add(acc));
    if (avatar.features.style) styles.add(avatar.features.style);
  });

  return {
    genders: Array.from(genders),
    accessories: Array.from(accessories),
    styles: Array.from(styles)
  };
};
