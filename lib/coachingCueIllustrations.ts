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
  sport: "squat" | "shooting" | "general";
  faultLabel: string;
  fixLabel: string;
  svgFault: string;
  svgFix: string;
};

export const CUES: CueIllustration[] = [
  {
    id: "trunk-lean",
    keywords: ["chest", "trunk", "lean", "forward", "torso", "upright"],
    bodyZone: "trunk",
    sport: "squat",
    faultLabel: "Forward lean",
    fixLabel: "Chest tall",
    svgFault:
      "M30 16 L18 40 M18 40 L12 58 M18 40 L26 58 M24 26 L10 34 M24 26 L35 35",
    svgFix:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L18 35 M30 26 L42 35",
  },
  {
    id: "knee-cave",
    keywords: ["knee", "knees", "cave", "valgus", "inward", "collapse", "tracking"],
    bodyZone: "knees",
    sport: "squat",
    faultLabel: "Knees caving",
    fixLabel: "Knees out",
    svgFault:
      "M30 16 L30 36 M30 36 L20 58 M30 36 L40 58 M30 24 L16 30 M30 24 L44 30 M20 58 L26 70 M40 58 L34 70",
    svgFix:
      "M30 16 L30 36 M30 36 L18 58 M30 36 L42 58 M30 24 L16 30 M30 24 L44 30 M18 58 L14 70 M42 58 L46 70",
  },
  {
    id: "heel-rise",
    keywords: ["heel", "heels", "lift", "rise", "dorsiflexion", "ankle", "foot", "planted"],
    bodyZone: "feet",
    sport: "squat",
    faultLabel: "Heels rising",
    fixLabel: "Full foot contact",
    svgFault:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 24 L18 32 M30 24 L42 32 M22 58 L28 69 M38 58 L42 67",
    svgFix:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 24 L18 32 M30 24 L42 32 M18 69 L30 69 M30 69 L44 69",
  },
  {
    id: "shallow-depth",
    keywords: ["depth", "shallow", "parallel", "below", "hip crease"],
    bodyZone: "hips",
    sport: "squat",
    faultLabel: "Too shallow",
    fixLabel: "Full depth",
    svgFault:
      "M30 16 L30 34 M30 34 L20 44 M30 34 L40 44 M20 44 L20 60 M40 44 L40 60 M30 24 L18 28 M30 24 L42 28",
    svgFix:
      "M30 16 L30 34 M30 34 L18 50 M30 34 L42 50 M18 50 L14 66 M42 50 L46 66 M30 24 L18 30 M30 24 L42 30",
  },
  {
    id: "butt-wink",
    keywords: ["butt wink", "lumbar", "spine", "pelvis", "tuck", "rounding", "lower back"],
    bodyZone: "hips",
    sport: "squat",
    faultLabel: "Pelvis tucking",
    fixLabel: "Neutral spine",
    svgFault:
      "M30 16 Q24 27 30 38 M30 38 L19 52 M30 38 L41 52 M19 52 L15 66 M41 52 L45 66 M30 24 L18 30 M30 24 L42 30",
    svgFix:
      "M30 16 L30 38 M30 38 L19 52 M30 38 L41 52 M19 52 L15 66 M41 52 L45 66 M30 24 L18 30 M30 24 L42 30",
  },
  {
    id: "sit-back",
    keywords: ["sit back", "hips back", "hip hinge", "weight", "heels"],
    bodyZone: "hips",
    sport: "squat",
    faultLabel: "Knees first",
    fixLabel: "Hips back first",
    svgFault:
      "M30 16 L30 36 M30 36 L25 50 M30 36 L39 52 M25 50 L28 66 M39 52 L43 68 M30 24 L18 30 M30 24 L42 30",
    svgFix:
      "M30 16 L24 36 M24 36 L12 50 M24 36 L33 52 M12 50 L8 66 M33 52 L37 68 M26 24 L14 30 M26 24 L38 30",
  },
  {
    id: "elbow-flare",
    keywords: ["elbow", "flare", "flared", "tuck", "aligned", "chicken wing"],
    bodyZone: "elbow",
    sport: "shooting",
    faultLabel: "Elbow out",
    fixLabel: "Elbow in",
    svgFault:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L42 18 M42 18 L50 26 M30 26 L18 30",
    svgFix:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L34 16 M34 16 L38 24 M30 26 L18 30",
  },
  {
    id: "follow-through",
    keywords: ["follow through", "follow-through", "wrist", "snap", "cookie jar", "hold"],
    bodyZone: "release",
    sport: "shooting",
    faultLabel: "No follow-through",
    fixLabel: "Hold the pose",
    svgFault:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L40 20 M40 20 L46 28 M30 26 L18 30",
    svgFix:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L40 14 M40 14 L47 16 M30 26 L18 30",
  },
  {
    id: "release-height",
    keywords: ["release", "low", "height", "peak", "jump", "timing"],
    bodyZone: "release",
    sport: "shooting",
    faultLabel: "Low release",
    fixLabel: "Release at peak",
    svgFault:
      "M30 18 L30 42 M30 42 L22 60 M30 42 L38 60 M30 28 L40 24 M40 24 L46 30 M30 28 L18 32",
    svgFix:
      "M30 12 L30 36 M30 36 L22 54 M30 36 L38 54 M30 22 L40 10 M40 10 L47 14 M30 22 L18 26",
  },
  {
    id: "shot-arc",
    keywords: ["arc", "flat", "trajectory", "angle", "high", "backspin"],
    bodyZone: "release",
    sport: "shooting",
    faultLabel: "Flat arc",
    fixLabel: "Higher arc",
    svgFault:
      "M18 62 L30 40 M30 40 L38 62 M30 28 L40 20 M40 20 L46 28 M44 18 Q50 16 56 18",
    svgFix:
      "M18 62 L30 40 M30 40 L38 62 M30 28 L40 20 M40 20 L46 28 M40 24 Q50 4 58 18",
  },
  {
    id: "balance-base",
    keywords: ["balance", "base", "feet", "stance", "stable", "drift", "forward"],
    bodyZone: "balance",
    sport: "shooting",
    faultLabel: "Off balance",
    fixLabel: "Stable base",
    svgFault:
      "M30 16 L24 40 M24 40 L20 58 M24 40 L30 58 M24 26 L12 34 M24 26 L36 30 M18 68 L28 68 M28 68 L34 68",
    svgFix:
      "M30 16 L30 40 M30 40 L20 58 M30 40 L40 58 M30 26 L18 34 M30 26 L42 30 M14 68 L24 68 M36 68 L46 68",
  },
  {
    id: "off-hand",
    keywords: ["off hand", "guide hand", "thumb", "pushing", "interference"],
    bodyZone: "arms",
    sport: "shooting",
    faultLabel: "Guide hand pushes",
    fixLabel: "Guide hand stays",
    svgFault:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L40 20 M30 26 L24 18 M24 18 L33 16",
    svgFix:
      "M30 16 L30 40 M30 40 L22 58 M30 40 L38 58 M30 26 L40 20 M30 26 L20 34 M40 20 L47 24",
  },
];

export function getCueIllustration(
  cueText: string,
  sport: "squat" | "shooting",
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

