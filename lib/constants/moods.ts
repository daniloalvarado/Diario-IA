export const MOOD_OPTIONS = [
  {
    icon: "sentiment-very-dissatisfied",
    label: "Muy Triste",
    value: "very-sad",
    color: "#ef4444",
  },
  {
    icon: "sentiment-dissatisfied",
    label: "Triste",
    value: "sad",
    color: "#f97316",
  },
  {
    icon: "sentiment-neutral",
    label: "Neutral",
    value: "neutral",
    color: "#6b7280",
  },
  {
    icon: "sentiment-satisfied",
    label: "Feliz",
    value: "happy",
    color: "#22c55e",
  },
  {
    icon: "sentiment-very-satisfied",
    label: "Muy Feliz",
    value: "very-happy",
    color: "#eab308",
  },
] as const;

// Create a lookup map for quick mood config access by value
export const MOOD_CONFIG = MOOD_OPTIONS.reduce((acc, mood) => {
  acc[mood.value] = mood;
  return acc;
}, {} as Record<string, (typeof MOOD_OPTIONS)[number]>);

export const getMoodConfig = (moodValue: string) => {
  return MOOD_CONFIG[moodValue] || MOOD_CONFIG.neutral;
};
