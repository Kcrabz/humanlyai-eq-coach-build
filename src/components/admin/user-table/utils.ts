
export const getBadgeVariant = (tier?: string) => {
  switch (tier) {
    case "premium": return "default";
    case "basic": return "outline";
    case "trial": return "secondary";
    default: return "secondary"; // free tier or undefined
  }
};
