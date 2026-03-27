export type CueIllustration = {
  id: string;
  keywords: string[];
  bodyZone:
    | "trunk"
    | "knees"
    | "feet"
    | "arms"
    | "hips"
    | "elbow"
    | "release"
    | "balance";
  sport: "squat" | "shooting" | "deadlift" | "general";
  emoji: string;
  faultLabel: string;
  fixLabel: string;
};

export const CUES: CueIllustration[] = [
  {
    id: "trunk-lean",
    keywords: ["chest", "trunk", "lean", "forward", "torso", "upright"],
    bodyZone: "trunk",
    sport: "squat",
    emoji: "🏋️",
    faultLabel: "Forward lean",
    fixLabel: "Chest tall",
  },
  {
    id: "knee-cave",
    keywords: ["knee", "knees", "cave", "valgus", "inward", "collapse", "tracking"],
    bodyZone: "knees",
    sport: "squat",
    emoji: "🦵",
    faultLabel: "Knees caving",
    fixLabel: "Knees out",
  },
  {
    id: "heel-rise",
    keywords: ["heel", "heels", "lift", "rise", "dorsiflexion", "ankle", "foot", "planted"],
    bodyZone: "feet",
    sport: "squat",
    emoji: "👟",
    faultLabel: "Heels rising",
    fixLabel: "Full foot contact",
  },
  {
    id: "shallow-depth",
    keywords: ["depth", "shallow", "parallel", "below", "hip crease"],
    bodyZone: "hips",
    sport: "squat",
    emoji: "⚡",
    faultLabel: "Too shallow",
    fixLabel: "Full depth",
  },
  {
    id: "butt-wink",
    keywords: ["butt wink", "lumbar", "spine", "pelvis", "tuck", "rounding", "lower back"],
    bodyZone: "hips",
    sport: "squat",
    emoji: "⚡",
    faultLabel: "Pelvis tucking",
    fixLabel: "Neutral spine",
  },
  {
    id: "sit-back",
    keywords: ["sit back", "hips back", "hip hinge", "weight", "heels"],
    bodyZone: "hips",
    sport: "squat",
    emoji: "⚡",
    faultLabel: "Knees first",
    fixLabel: "Hips back first",
  },
  {
    id: "elbow-flare",
    keywords: ["elbow", "flare", "flared", "tuck", "aligned", "chicken wing"],
    bodyZone: "elbow",
    sport: "shooting",
    emoji: "💪",
    faultLabel: "Elbow out",
    fixLabel: "Elbow in",
  },
  {
    id: "follow-through",
    keywords: ["follow through", "follow-through", "wrist", "snap", "cookie jar", "hold"],
    bodyZone: "release",
    sport: "shooting",
    emoji: "🎯",
    faultLabel: "No follow-through",
    fixLabel: "Hold the pose",
  },
  {
    id: "release-height",
    keywords: ["release", "low", "height", "peak", "jump", "timing"],
    bodyZone: "release",
    sport: "shooting",
    emoji: "🎯",
    faultLabel: "Low release",
    fixLabel: "Release at peak",
  },
  {
    id: "shot-arc",
    keywords: ["arc", "flat", "trajectory", "angle", "high", "backspin"],
    bodyZone: "release",
    sport: "shooting",
    emoji: "🎯",
    faultLabel: "Flat arc",
    fixLabel: "Higher arc",
  },
  {
    id: "balance-base",
    keywords: ["balance", "base", "feet", "stance", "stable", "drift", "forward"],
    bodyZone: "balance",
    sport: "shooting",
    emoji: "⚖️",
    faultLabel: "Off balance",
    fixLabel: "Stable base",
  },
  {
    id: "off-hand",
    keywords: ["off hand", "guide hand", "thumb", "pushing", "interference"],
    bodyZone: "arms",
    sport: "shooting",
    emoji: "💪",
    faultLabel: "Guide hand pushes",
    fixLabel: "Guide hand stays",
  },
  {
    id: "hip-hinge",
    keywords: [
      "hip",
      "hinge",
      "hips back",
      "sit back",
      "squat the deadlift",
      "chest up",
    ],
    bodyZone: "hips",
    sport: "deadlift",
    emoji: "⚡",
    faultLabel: "Squatting it",
    fixLabel: "Hinge back",
  },
  {
    id: "bar-drift",
    keywords: ["bar", "drift", "away", "close", "contact", "legs", "path"],
    bodyZone: "arms",
    sport: "deadlift",
    emoji: "📏",
    faultLabel: "Bar drifting",
    fixLabel: "Bar stays close",
  },
  {
    id: "back-rounding",
    keywords: [
      "round",
      "rounding",
      "lumbar",
      "thoracic",
      "spine",
      "neutral",
      "back",
    ],
    bodyZone: "trunk",
    sport: "deadlift",
    emoji: "🏋️",
    faultLabel: "Back rounding",
    fixLabel: "Neutral spine",
  },
  {
    id: "lockout-hyper",
    keywords: [
      "lockout",
      "hyperextend",
      "lean back",
      "full extension",
      "glute",
    ],
    bodyZone: "hips",
    sport: "deadlift",
    emoji: "⚡",
    faultLabel: "Hyperextending",
    fixLabel: "Stand tall",
  },
  {
    id: "shin-angle",
    keywords: ["shin", "angle", "bar position", "setup", "over bar"],
    bodyZone: "feet",
    sport: "deadlift",
    emoji: "👟",
    faultLabel: "Poor setup",
    fixLabel: "Shins vertical",
  },
];

export function getCueIllustration(
  cueText: string,
  sport: "squat" | "shooting" | "deadlift",
): CueIllustration | null {
  const text = cueText.toLowerCase();
  const matches = CUES.filter((cue) =>
    cue.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );
  if (matches.length === 0) return null;

  const sportMatch = matches.find((cue) => cue.sport === sport);
  if (sportMatch) return sportMatch;

  const generalMatch = matches.find((cue) => cue.sport === "general");
  if (generalMatch) return generalMatch;

  return matches[0] ?? null;
}

