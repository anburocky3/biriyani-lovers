import recipeData from "@/app/data/recipes.json";

export type VesselKey = "cooker" | "dabara" | "open_pot" | "handi";
export type ProteinType = "veg" | "chicken" | "mutton";
export type RiceUnit = "glass" | "ml";

export type VesselRecipe = {
  label: string;
  labelTa?: string;
  subtitle: string;
  subtitleTa?: string;
  waterRatio: number | null;
  waterMethod: string;
  waterMethodTa?: string;
  cookMethod: string;
  cookMethodTa?: string;
  steps: string[];
  stepsTa?: string[];
  chefTips: string[];
  chefTipsTa?: string[];
  stepTips?: string[];
  stepTipsTa?: string[];
};

export type LanguageCode = "en" | "ta";

export type IngredientRow = {
  name: string;
  quantity: string;
  note?: string;
};

export type TimelineEntry = {
  timeLabel: string;
  title: string;
  details: string;
  spices: string[];
  tip: string;
};

export type RecipePlan = {
  vessel: VesselKey;
  vesselLabel: string;
  proteinLabel: string;
  riceMl: number;
  people: number;
  waterText: string;
  whistleText: string;
  cookMethod: string;
  ingredients: IngredientRow[];
  prerequisites: TimelineEntry[];
  timeline: TimelineEntry[];
  steps: string[];
  chefTips: string[];
  stepTips: string[];
};

const GLASS_TO_ML = 180;
const ML_PER_PERSON = 90;

const RECIPES = recipeData as Record<VesselKey, VesselRecipe>;

const round = (value: number, precision = 1): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const formatMl = (value: number): string => `${Math.round(value)} ml`;
const formatTsp = (value: number): string => `${round(value)} tsp`;

export const vesselKeys = Object.keys(RECIPES) as VesselKey[];
export const vesselRecipes = RECIPES;

export function getRecipeCopy(
  vessel: VesselKey,
  language: LanguageCode,
): VesselRecipe {
  const recipe = RECIPES[vessel];

  if (language === "ta") {
    return {
      ...recipe,
      label: recipe.labelTa ?? recipe.label,
      subtitle: recipe.subtitleTa ?? recipe.subtitle,
      waterMethod: recipe.waterMethodTa ?? recipe.waterMethod,
      cookMethod: recipe.cookMethodTa ?? recipe.cookMethod,
      steps: recipe.stepsTa ?? recipe.steps,
      chefTips: recipe.chefTipsTa ?? recipe.chefTips,
    };
  }

  return recipe;
}

export function toRiceMl(quantity: number, unit: RiceUnit): number {
  if (unit === "glass") return quantity * GLASS_TO_ML;
  return quantity;
}

function resolveRiceMl(
  quantity: number,
  unit: RiceUnit,
  people?: number,
): number {
  if (quantity > 0) {
    return Math.max(toRiceMl(quantity, unit), GLASS_TO_ML / 2);
  }

  if (people && people > 0) {
    return Math.max(people * ML_PER_PERSON, GLASS_TO_ML / 2);
  }

  return GLASS_TO_ML;
}

function resolvePeople(riceMl: number, inputPeople?: number): number {
  if (inputPeople && inputPeople > 0) return Math.round(inputPeople);
  return Math.max(1, Math.round(riceMl / ML_PER_PERSON));
}

function getProteinLabel(
  proteinType: ProteinType,
  language: LanguageCode,
): string {
  if (language === "ta") {
    if (proteinType === "veg") return "காய்கறி + பன்னீர்";
    if (proteinType === "chicken") return "சிக்கன்";
    return "மட்டன்";
  }

  if (proteinType === "veg") return "vegetable mix + paneer";
  if (proteinType === "chicken") return "chicken";
  return "mutton";
}

function getWhistleCount(proteinType: ProteinType): number | null {
  if (proteinType === "veg") return 1;
  if (proteinType === "chicken") return 2;
  return 4;
}

function getWhistleText(
  vessel: VesselKey,
  proteinType: ProteinType,
  language: LanguageCode,
): string {
  if (vessel !== "cooker") {
    return language === "ta"
      ? "இந்த பாத்திரத்திற்கு விசில் தேவையில்லை; நேரமும் டமும் பயன்படுத்தவும்."
      : "This vessel does not use whistles; follow the timing and dum steps instead.";
  }

  const whistles = getWhistleCount(proteinType) ?? 0;

  if (language === "ta") {
    return `${whistles} விசில் பரிந்துரை`;
  }

  return `${whistles} whistle${whistles > 1 ? "s" : ""} recommended`;
}

function getProteinQuantity(proteinType: ProteinType, factor: number): number {
  if (proteinType === "veg") return Math.round(220 * factor);
  if (proteinType === "chicken") return Math.round(250 * factor);
  return Math.round(300 * factor);
}

function getProteinNote(
  proteinType: ProteinType,
  language: LanguageCode,
): string {
  if (language === "ta") {
    if (proteinType === "veg") return "கேரட், பீன்ஸ், பட்டாணி, பன்னீர்";
    if (proteinType === "chicken")
      return "எலும்புடன் அல்லது எலும்பில்லாமல் துண்டுகள்";
    return "மெல்லிய மற்றும் சமமான மாட்டு/ஆடு துண்டுகள்";
  }

  if (proteinType === "veg") return "Carrot, beans, peas, paneer";
  if (proteinType === "chicken") return "Bone-in or boneless pieces";
  return "Evenly cut mutton pieces";
}

function getProteinTip(
  proteinType: ProteinType,
  language: LanguageCode,
): string {
  if (language === "ta") {
    if (proteinType === "veg")
      return "சைவத்திற்கு குறைந்த ஊறுகாய் நேரம் போதும்.";
    if (proteinType === "chicken")
      return "சிக்கனுக்கு 20-30 நிமிட ஊறுகாய் போதும்.";
    return "மட்டனுக்கு குறைந்தது 45 நிமிடம் அல்லது அதற்கு மேல் மரினேட் செய்யவும்.";
  }

  if (proteinType === "veg") return "Vegetables need a shorter marinade time.";
  if (proteinType === "chicken")
    return "Chicken usually needs 20-30 minutes of marination.";
  return "Mutton needs at least 45 minutes of marination.";
}

function formatWholeSpiceCount(amount: number): string {
  return `${Math.max(1, Math.round(amount))}`;
}

function getScaledKitchenMeasure(factor: number): {
  oilTbsp: number;
  gheeTbsp: number;
  onionCount: number;
  tomatoCount: number;
  curdMl: number;
  mintCount: number;
  corianderCount: number;
} {
  return {
    oilTbsp: round(2.5 * factor, 2),
    gheeTbsp: round(1.5 * factor, 2),
    onionCount: Math.max(1, Math.round(1.2 * factor)),
    tomatoCount: Math.max(1, Math.round(1 * factor)),
    curdMl: Math.round(70 * factor),
    mintCount: Math.max(1, Math.round(2 * factor)),
    corianderCount: Math.max(1, Math.round(2 * factor)),
  };
}

function getBaseHeatGuide(
  factor: number,
  language: LanguageCode,
): {
  details: string;
  spices: string[];
} {
  const oilTbsp = round(2.5 * factor, 2);
  const gheeTbsp = round(1.5 * factor, 2);
  const bayLeafCount = formatWholeSpiceCount(1 * factor);
  const cinnamonCount = formatWholeSpiceCount(1 * factor);
  const clovesCount = formatWholeSpiceCount(4 * factor);
  const cardamomCount = formatWholeSpiceCount(3 * factor);
  const starAniseCount = formatWholeSpiceCount(1 * factor);
  const fennelTsp = round(0.75 * factor, 2);

  if (language === "ta") {
    return {
      details: `குக்கரில் ${oilTbsp} tbsp எண்ணெய் + ${gheeTbsp} tbsp நெய் சேர்த்து, ${bayLeafCount} பிரியாணி இலை, ${cinnamonCount} பட்டை, ${clovesCount} கிராம்பு, ${cardamomCount} ஏலக்காய், ${starAniseCount} அனாசிப் பூ, ${fennelTsp} tsp பெருஞ்சீரகம் சேர்த்து நன்றாக மணம் வரும் வரை சூடாக்கவும்.`,
      spices: [
        `எண்ணெய் ${oilTbsp} tbsp`,
        `நெய் ${gheeTbsp} tbsp`,
        `${bayLeafCount} பிரியாணி இலை`,
        `${cinnamonCount} பட்டை`,
        `${clovesCount} கிராம்பு`,
        `${cardamomCount} ஏலக்காய்`,
        `${starAniseCount} அனாசிப் பூ`,
        `${fennelTsp} tsp பெருஞ்சீரகம்`,
      ],
    };
  }

  return {
    details: `Add ${oilTbsp} tbsp oil + ${gheeTbsp} tbsp ghee, then let ${bayLeafCount} bay leaf, ${cinnamonCount} cinnamon stick, ${clovesCount} cloves, ${cardamomCount} cardamom pods, ${starAniseCount} star anise, and ${fennelTsp} tsp fennel seeds bloom until fragrant.`,
    spices: [
      `Oil ${oilTbsp} tbsp`,
      `Ghee ${gheeTbsp} tbsp`,
      `${bayLeafCount} bay leaf`,
      `${cinnamonCount} cinnamon stick`,
      `${clovesCount} cloves`,
      `${cardamomCount} cardamom pods`,
      `${starAniseCount} star anise`,
      `${fennelTsp} tsp fennel seeds`,
    ],
  };
}

function applyProteinReplacement(step: string, proteinLabel: string): string {
  return step.replaceAll("{protein}", proteinLabel);
}

function getMarinationTimeLabel(proteinType: ProteinType): string {
  if (proteinType === "mutton") return "T-45 min";
  if (proteinType === "chicken") return "T-20 min";
  return "T-15 min";
}

function buildPrerequisites(
  proteinType: ProteinType,
  language: LanguageCode,
  proteinLabel: string,
  factor: number,
): TimelineEntry[] {
  const proteinTip = getProteinTip(proteinType, language);
  const kitchen = getScaledKitchenMeasure(factor);
  const riceMl = Math.round(factor * GLASS_TO_ML);

  return [
    {
      timeLabel: "T-30 min",
      title: language === "ta" ? "அரிசி ஊறவைக்கவும்" : "Soak rice",
      details:
        language === "ta"
          ? `அரிசியை 2 முதல் 3 முறை கழுவி, ${Math.round(factor)} glass (${riceMl} ml) தண்ணீரில் 20 முதல் 30 நிமிடம் ஊறவைக்கவும்.`
          : `Wash the rice 2 to 3 times and soak ${Math.round(factor)} glass (${riceMl} ml) of rice in water for 20 to 30 minutes.`,
      spices:
        language === "ta"
          ? ["அரிசி", `${riceMl} ml தண்ணீர்`]
          : ["Rice", `${riceMl} ml water`],
      tip:
        language === "ta"
          ? "சமைப்பதற்கு முன் முழுவதும் வடிகட்டி விடுங்கள்."
          : "Drain completely before it goes into the pot.",
    },
    {
      timeLabel: getMarinationTimeLabel(proteinType),
      title:
        language === "ta"
          ? `${proteinLabel} மரினேஷன்`
          : `${proteinLabel} marination`,
      details:
        language === "ta"
          ? `${proteinLabel} மீது ${kitchen.curdMl} ml தயிர், 1.5 tsp மிளகாய் தூள், 0.5 tsp மஞ்சள், 1 tbsp இஞ்சி-பூண்டு விழுது, ${kitchen.mintCount} கைப்பிடி புதினா, ${kitchen.corianderCount} கைப்பிடி தனியா மற்றும் 1.25 tsp உப்பு சேர்த்து கலந்து வைக்கவும்.`
          : `Mix ${proteinLabel} with ${kitchen.curdMl} ml curd, 1.5 tsp chili powder, 0.5 tsp turmeric, 1 tbsp ginger-garlic paste, ${kitchen.mintCount} handfuls mint, ${kitchen.corianderCount} handfuls coriander, and 1.25 tsp salt.`,
      spices:
        language === "ta"
          ? [
              `${kitchen.curdMl} ml தயிர்`,
              "1.5 tsp மிளகாய் தூள்",
              "0.5 tsp மஞ்சள்",
              "1 tbsp இஞ்சி-பூண்டு விழுது",
              `${kitchen.mintCount} கைப்பிடி புதினா`,
              `${kitchen.corianderCount} கைப்பிடி தனியா`,
              "1.25 tsp உப்பு",
            ]
          : [
              `${kitchen.curdMl} ml curd`,
              "1.5 tsp chili powder",
              "0.5 tsp turmeric",
              "1 tbsp ginger-garlic paste",
              `${kitchen.mintCount} handfuls mint`,
              `${kitchen.corianderCount} handfuls coriander`,
              "1.25 tsp salt",
            ],
      tip: proteinTip,
    },
  ];
}

function buildTimeline(
  vessel: VesselKey,
  language: LanguageCode,
  proteinType: ProteinType,
  proteinLabel: string,
  whistleText: string,
  factor: number,
): TimelineEntry[] {
  const kitchen = getScaledKitchenMeasure(factor);
  const baseHeatGuide = getBaseHeatGuide(factor, language);
  const cookerTimeline: TimelineEntry[] = [
    {
      timeLabel: "0 sec",
      title: language === "ta" ? "அடிப்பை சூடாக்கவும்" : "Heat the base",
      details: baseHeatGuide.details,
      spices: baseHeatGuide.spices,
      tip:
        language === "ta"
          ? "முழு மசாலா நன்றாக வெடித்தால் அடுத்த படிக்கு செல்லவும்."
          : "Move on once the spices bloom and the oil smells aromatic.",
    },
    {
      timeLabel: "10 sec",
      title: language === "ta" ? "வெங்காயம் சேர்க்கவும்" : "Add onions",
      details:
        language === "ta"
          ? "சிறிது உப்புடன் வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை வதக்கவும்."
          : "Add onions with a pinch of salt and saute until golden.",
      spices:
        language === "ta"
          ? [`${kitchen.onionCount} பெரிய வெங்காயம்`, "உப்பு"]
          : [`${kitchen.onionCount} medium onion`, "Salt"],
      tip:
        language === "ta"
          ? "பொன்னிற வெங்காயம் தான் குக்கர் பிரியாணிக்கு அடிப்படை சுவை."
          : "Golden onions give the cooker biriyani its base flavor.",
    },
    {
      timeLabel: "45 sec",
      title:
        language === "ta"
          ? "பச்சை மிளகாய் மற்றும் இஞ்சி-பூண்டு"
          : "Add ginger-garlic and chili",
      details:
        language === "ta"
          ? "இஞ்சி-பூண்டு விழுது மற்றும் பச்சை மிளகாய் சேர்த்து பச்சை வாசனை மறையும் வரை சமைக்கவும்."
          : "Stir in ginger-garlic paste and green chili until the raw smell fades.",
      spices:
        language === "ta"
          ? ["இஞ்சி-பூண்டு விழுது", "பச்சை மிளகாய்"]
          : ["Ginger-garlic paste", "Green chili"],
      tip:
        language === "ta"
          ? "வாசனை மறைய வேண்டும்; எரியக் கூடாது."
          : "Cook just enough to remove the raw smell, not burn it.",
    },
    {
      timeLabel: "1 min 15 sec",
      title: language === "ta" ? "தக்காளி + மசாலா" : "Tomato + spice powders",
      details:
        language === "ta"
          ? "தக்காளி, மிளகாய் தூள், பிரியாணி மசாலா, மஞ்சள் சேர்த்து மென்மையாகும் வரை கிளறவும்."
          : "Add tomato, chili powder, biriyani masala, and turmeric, then cook until glossy.",
      spices:
        language === "ta"
          ? [
              `${kitchen.tomatoCount} தக்காளி`,
              `${round(1.5 * factor, 2)} tsp மிளகாய் தூள்`,
              `${round(1.5 * factor, 2)} tsp பிரியாணி மசாலா`,
              `${round(0.5 * factor, 2)} tsp மஞ்சள்`,
            ]
          : [
              `${kitchen.tomatoCount} tomato`,
              `${round(1.5 * factor, 2)} tsp chili powder`,
              `${round(1.5 * factor, 2)} tsp biriyani masala`,
              `${round(0.5 * factor, 2)} tsp turmeric`,
            ],
      tip:
        language === "ta"
          ? "தக்காளி கரையும்போது மட்டுமே அடுத்த கட்டத்திற்கு செல்லவும்."
          : "Proceed only when the tomato turns soft and the masala looks glossy.",
    },
    {
      timeLabel: "2 min",
      title:
        language === "ta"
          ? `${proteinLabel} சேர்க்கவும்`
          : `Add ${proteinLabel}`,
      details:
        language === "ta"
          ? `மரினேட் செய்த ${proteinLabel} சேர்த்து, வெளிப்புற நிறம் மாறும் வரை மட்டும் சற்று வதக்கவும்.`
          : `Add the marinated ${proteinLabel} and saute only until the outside changes color.`,
      spices:
        language === "ta"
          ? [
              `மரினேட் செய்த ${proteinLabel}`,
              `${kitchen.curdMl} ml தயிர்`,
              `${kitchen.mintCount} கைப்பிடி புதினா`,
              `${kitchen.corianderCount} கைப்பிடி தனியா`,
            ]
          : [
              `Marinated ${proteinLabel}`,
              `${kitchen.curdMl} ml curd`,
              `${kitchen.mintCount} handfuls mint`,
              `${kitchen.corianderCount} handfuls coriander`,
            ],
      tip: getProteinTip(proteinType, language),
    },
    {
      timeLabel: "4 min",
      title: language === "ta" ? "அரிசி + தண்ணீர்" : "Add rice and water",
      details:
        language === "ta"
          ? "ஊற வைத்த அரிசி, அளவிட்ட தண்ணீர் மற்றும் மீதமுள்ள புதினா-தனியாவை சேர்த்து ஒரு முறை மட்டும் மெதுவாக மடக்கவும்."
          : "Add soaked rice, measured water, and remaining mint-coriander. Fold once gently.",
      spices:
        language === "ta"
          ? [
              `ஊற வைத்த அரிசி (${Math.round(factor)} glass)`,
              `${Math.round(factor * GLASS_TO_ML)} ml தண்ணீர்`,
              `${kitchen.mintCount} கைப்பிடி புதினா`,
              `${kitchen.corianderCount} கைப்பிடி தனியா`,
            ]
          : [
              `Soaked rice (${Math.round(factor)} glass)`,
              `${Math.round(factor * GLASS_TO_ML)} ml water`,
              `${kitchen.mintCount} handfuls mint`,
              `${kitchen.corianderCount} handfuls coriander`,
            ],
      tip:
        language === "ta"
          ? "அரிசி உடையாமல் இருக்க ஒரே முறை மட்டும் கிளறவும்."
          : "Stir only once so the rice grains stay intact.",
    },
    {
      timeLabel: "5 min",
      title: language === "ta" ? "மூடி வேகவைக்கவும்" : "Pressure cook",
      details:
        language === "ta"
          ? `மூடியை மூடி குறைந்த-நடுத்தர தீயில் ${whistleText} வைத்து, பின்னர் 10 முதல் 12 நிமிடம் ஓய்வில் விடவும்.`
          : `Close the lid and cook on low-medium flame for ${whistleText}, then rest for 10 to 12 minutes.`,
      spices: [],
      tip:
        language === "ta"
          ? "மூடியை விரைவாகத் திறக்காதீர்கள்; ஓய்வு சிறப்பாக வேகச் செய்கிறது."
          : "Do not open too early; resting finishes the rice cleanly.",
    },
  ];

  const handiTimeline: TimelineEntry[] = [
    {
      timeLabel: "0 sec",
      title:
        language === "ta"
          ? "மசாலா அடிப்பை ஆரம்பிக்கவும்"
          : "Start the masala base",
      details: baseHeatGuide.details,
      spices: baseHeatGuide.spices,
      tip: language === "ta" ? "மிதமான தீ போதும்." : "Keep the flame medium.",
    },
    {
      timeLabel: "30 sec",
      title: language === "ta" ? "வெங்காயம் சேர்க்கவும்" : "Add onions",
      details:
        language === "ta"
          ? "வெங்காயம் சேர்த்து பொன்னிறமாகும் வரை வதக்கவும்; பின்னர் இஞ்சி-பூண்டு விழுது சேர்க்கவும்."
          : "Saute onions until golden, then add ginger-garlic paste.",
      spices:
        language === "ta"
          ? [`${kitchen.onionCount} பெரிய வெங்காயம்`, "இஞ்சி-பூண்டு விழுது"]
          : [`${kitchen.onionCount} medium onion`, "Ginger-garlic paste"],
      tip:
        language === "ta"
          ? "வெங்காயம் கருப்பாகாதீர்கள்."
          : "Do not let the onions go dark.",
    },
    {
      timeLabel: "1 min 30 sec",
      title: language === "ta" ? "தக்காளி மற்றும் தூள்" : "Tomato and powders",
      details:
        language === "ta"
          ? "தக்காளி, மிளகாய் தூள், பிரியாணி மசாலா, மஞ்சள் சேர்த்து நன்றாக சுண்ட விடவும்."
          : "Add tomato, chili powder, biriyani masala, and turmeric, then cook down.",
      spices:
        language === "ta"
          ? [
              `${kitchen.tomatoCount} தக்காளி`,
              `${round(1.5 * factor, 2)} tsp மிளகாய் தூள்`,
              `${round(1.5 * factor, 2)} tsp பிரியாணி மசாலா`,
              `${round(0.5 * factor, 2)} tsp மஞ்சள்`,
            ]
          : [
              `${kitchen.tomatoCount} tomato`,
              `${round(1.5 * factor, 2)} tsp chili powder`,
              `${round(1.5 * factor, 2)} tsp biriyani masala`,
              `${round(0.5 * factor, 2)} tsp turmeric`,
            ],
      tip:
        language === "ta"
          ? "மசாலா கெட்டியாக வேண்டாம்; பளபளப்பாக இருக்க வேண்டும்."
          : "Aim for a glossy masala, not a dry one.",
    },
    {
      timeLabel: "3 min",
      title:
        language === "ta"
          ? `${proteinLabel} சேர்க்கவும்`
          : `Add ${proteinLabel}`,
      details:
        language === "ta"
          ? `மரினேட் செய்த ${proteinLabel} சேர்த்து எண்ணெய் பிரியும் வரை சமைக்கவும்.`
          : `Add the marinated ${proteinLabel} and cook until the oil separates.`,
      spices:
        language === "ta"
          ? [
              `மரினேட் செய்த ${proteinLabel}`,
              `${kitchen.curdMl} ml தயிர்`,
              `${formatTsp(0.75 * factor)} உப்பு`,
            ]
          : [
              `Marinated ${proteinLabel}`,
              `${kitchen.curdMl} ml curd`,
              `${formatTsp(0.75 * factor)} salt`,
            ],
      tip: getProteinTip(proteinType, language),
    },
    {
      timeLabel: "6 min",
      title:
        language === "ta" ? "அரிசி + சூடான நீர்" : "Add rice and hot water",
      details:
        language === "ta"
          ? "ஊற வைத்த அரிசி மற்றும் அளவிட்ட சூடான தண்ணீரை சேர்த்து, மேல் புதினா-தனியா தூவவும்."
          : "Add the soaked rice and measured hot water, then finish with mint and coriander.",
      spices:
        language === "ta"
          ? ["ஊற வைத்த அரிசி", "சூடான தண்ணீர்", "புதினா", "தனியா"]
          : ["Soaked rice", "Hot water", "Mint", "Coriander"],
      tip:
        language === "ta"
          ? "அரிசியை அழுத்தி விட வேண்டாம்."
          : "Do not press the rice down.",
    },
    {
      timeLabel: "7 min",
      title: language === "ta" ? "சீல் செய்து டம் செய்யவும்" : "Seal and dum",
      details:
        language === "ta"
          ? "ஹாண்டியை மூடி குறைந்த தீயில் வேகவைத்து, பிறகு 10 நிமிடம் ஓய்வில் விடவும்."
          : "Seal the handi, cook on low flame, and rest for 10 minutes.",
      spices: [],
      tip:
        language === "ta"
          ? "ஓய்வுக்குப் பிறகு மட்டுமே திறக்கவும்."
          : "Open only after resting.",
    },
  ];

  const openPotTimeline: TimelineEntry[] = [
    {
      timeLabel: "0 sec",
      title:
        language === "ta"
          ? "மசாலா அடிப்பை தயார் செய்யவும்"
          : "Build the masala base",
      details:
        language === "ta"
          ? "கனமான பாத்திரத்தில் எண்ணெய், வெங்காயம், தக்காளி மற்றும் முழு மசாலாவை சேர்த்து சமைக்கவும்."
          : "Start in a heavy-bottom pot with oil, onions, tomato, and whole spices.",
      spices:
        language === "ta"
          ? ["எண்ணெய்", "வெங்காயம்", "தக்காளி", "முழு மசாலா"]
          : ["Oil", "Onion", "Tomato", "Whole spices"],
      tip:
        language === "ta"
          ? "அடிப்பகுதி ஒட்டாமல் காக்கவும்."
          : "Keep the bottom from sticking.",
    },
    {
      timeLabel: "2 min",
      title:
        language === "ta"
          ? `${proteinLabel} வேகவைக்கவும்`
          : `Cook ${proteinLabel}`,
      details:
        language === "ta"
          ? `மரினேட் செய்த ${proteinLabel} ஐ மசாலாவில் 80% வரை சமைக்கவும்.`
          : `Cook the marinated ${proteinLabel} in the masala until nearly done.`,
      spices:
        language === "ta"
          ? ["மரினேட் செய்த இறைச்சி", "தயிர்", "உப்பு"]
          : ["Marinated meat", "Curd", "Salt"],
      tip: getProteinTip(proteinType, language),
    },
    {
      timeLabel: "5 min",
      title: language === "ta" ? "அரிசியை கொதிக்க வைக்கவும்" : "Boil the rice",
      details:
        language === "ta"
          ? "உப்பு மற்றும் முழு மசாலாவுடன் அரிசியை அதிக தண்ணீரில் 70 முதல் 80% வரை வேகவைக்கவும்."
          : "Boil rice in excess salted water with whole spices until 70 to 80 percent done.",
      spices:
        language === "ta"
          ? ["அரிசி", "உப்பு", "பிரியாணி இலை", "பட்டை", "கிராம்பு"]
          : ["Rice", "Salt", "Bay leaf", "Cinnamon", "Cloves"],
      tip:
        language === "ta"
          ? "அரிசி மெதுவாக அசைய அனுமதிக்கவும்."
          : "Let the rice move freely in the water.",
    },
    {
      timeLabel: "8 min",
      title: language === "ta" ? "வடிகட்டி அடுக்கவும்" : "Drain and layer",
      details:
        language === "ta"
          ? "அரிசியை முழுவதும் வடிகட்டி, மசாலாவின் மேல் மெதுவாக அடுக்கவும்."
          : "Drain the rice fully and layer it over the masala carefully.",
      spices: language === "ta" ? ["வடிகட்டிய அரிசி"] : ["Drained rice"],
      tip:
        language === "ta"
          ? "கூடுதல் கலவை தவிர்க்கவும்."
          : "Avoid extra mixing.",
    },
    {
      timeLabel: "10 min",
      title: language === "ta" ? "டம் செய்யவும்" : "Dum finish",
      details:
        language === "ta"
          ? "மூடியை நன்றாக மூடி குறைந்த தீயில் முடிக்கவும்."
          : "Cover tightly and finish on low flame.",
      spices: [],
      tip:
        language === "ta"
          ? "மூடியை திடீரெனத் திறக்காதீர்கள்."
          : "Do not open the lid abruptly.",
    },
  ];

  if (vessel === "cooker") {
    return cookerTimeline;
  }

  if (vessel === "handi") {
    return handiTimeline;
  }

  if (vessel === "open_pot") {
    return openPotTimeline;
  }

  return [
    {
      timeLabel: "0 sec",
      title:
        language === "ta"
          ? "மசாலா அடிப்பை தொடங்கவும்"
          : "Start the masala base",
      details:
        language === "ta"
          ? "வெங்காயம், தக்காளி, முழு மசாலாவுடன் அடிப்பை உருவாக்கவும்."
          : "Build the base with onions, tomato, and whole spices.",
      spices:
        language === "ta"
          ? ["வெங்காயம்", "தக்காளி", "முழு மசாலா"]
          : ["Onion", "Tomato", "Whole spices"],
      tip: language === "ta" ? "மெதுவாகவே கிளறவும்." : "Stir gently.",
    },
    {
      timeLabel: "3 min",
      title:
        language === "ta"
          ? `${proteinLabel} சேர்க்கவும்`
          : `Add ${proteinLabel}`,
      details:
        language === "ta"
          ? `மரினேட் செய்த ${proteinLabel} ஐ சேர்த்து எண்ணெய் பிரியும் வரை சமைக்கவும்.`
          : `Add the marinated ${proteinLabel} and cook until the oil separates.`,
      spices:
        language === "ta" ? ["மரினேட் செய்த இறைச்சி"] : ["Marinated meat"],
      tip: getProteinTip(proteinType, language),
    },
  ];
}

function resolveStepTips(
  recipe: VesselRecipe,
  language: LanguageCode,
  proteinType: ProteinType,
): string[] {
  const baseTips =
    language === "ta"
      ? (recipe.stepTipsTa ?? recipe.stepTips)
      : recipe.stepTips;

  if (baseTips && baseTips.length === recipe.steps.length) {
    const proteinTip = getProteinTip(proteinType, language);

    return baseTips.map((tip, index) => {
      const whistleText = getWhistleText("cooker", proteinType, language);
      return tip
        .replaceAll("{protein}", getProteinLabel(proteinType, language))
        .replaceAll("{whistle}", whistleText)
        .replaceAll("{proteinTip}", proteinTip)
        .replaceAll("{step}", `${index + 1}`);
    });
  }

  return recipe.steps.map(() => "");
}

export function generateRecipePlan(args: {
  vessel: VesselKey;
  riceQuantity: number;
  riceUnit: RiceUnit;
  people?: number;
  proteinType: ProteinType;
  language?: LanguageCode;
}): RecipePlan {
  const language = args.language ?? "en";
  const recipe = getRecipeCopy(args.vessel, language);
  const riceMl = resolveRiceMl(args.riceQuantity, args.riceUnit, args.people);
  const people = resolvePeople(riceMl, args.people);
  const factor = riceMl / GLASS_TO_ML;
  const proteinLabel = getProteinLabel(args.proteinType, language);
  const whistleText = getWhistleText(args.vessel, args.proteinType, language);
  const proteinQuantity = getProteinQuantity(args.proteinType, factor);
  const proteinNote = getProteinNote(args.proteinType, language);
  const stepTips = resolveStepTips(recipe, language, args.proteinType);
  const prerequisites = buildPrerequisites(
    args.proteinType,
    language,
    proteinLabel,
    factor,
  );
  const timeline = buildTimeline(
    args.vessel,
    language,
    args.proteinType,
    proteinLabel,
    whistleText,
    factor,
  );

  const waterText =
    recipe.waterRatio === null
      ? language === "ta"
        ? "அதிக கொதிநீர் பயன்படுத்தி, 75% வரை வேகவைத்து வடிகட்டவும்."
        : "Use excess boiling water (about 6x rice volume), cook to 75% and drain."
      : language === "ta"
        ? `${formatMl(riceMl * recipe.waterRatio)} (${round(recipe.waterRatio, 2)} மடங்கு அரிசி)`
        : `${formatMl(riceMl * recipe.waterRatio)} (${round(recipe.waterRatio, 2)}x rice)`;

  const ingredients: IngredientRow[] = [
    {
      name: "Seeraga samba / basmati rice",
      quantity: `${round(factor, 2)} glass (${formatMl(riceMl)})`,
    },
    { name: "Water", quantity: waterText },
    {
      name: proteinLabel,
      quantity: `${proteinQuantity} g`,
      note: proteinNote,
    },
    {
      name: "Onion",
      quantity: `${Math.max(1, Math.round(1.2 * factor))} medium`,
    },
    {
      name: "Tomato",
      quantity: `${Math.max(1, Math.round(1 * factor))} medium`,
    },
    { name: "Curd", quantity: `${getScaledKitchenMeasure(factor).curdMl} ml` },
    {
      name: "Oil + ghee",
      quantity: `${getScaledKitchenMeasure(factor).oilTbsp} tbsp oil + ${getScaledKitchenMeasure(factor).gheeTbsp} tbsp ghee`,
    },
    { name: "Ginger-garlic paste", quantity: formatTsp(2 * factor) },
    { name: "Biriyani masala", quantity: formatTsp(1.6 * factor) },
    { name: "Chili powder", quantity: formatTsp(0.8 * factor) },
    {
      name: "Salt",
      quantity: formatTsp(0.75 * factor),
      note: "Adjust after tasting stock",
    },
    {
      name: "Mint + coriander",
      quantity: `${getScaledKitchenMeasure(factor).mintCount} handful mint + ${getScaledKitchenMeasure(factor).corianderCount} handful coriander`,
    },
  ];

  const steps = recipe.steps.map(
    (step, index) =>
      `${index + 1}. ${applyProteinReplacement(step, proteinLabel)}`,
  );

  return {
    vessel: args.vessel,
    vesselLabel: recipe.label,
    proteinLabel,
    riceMl,
    people,
    waterText,
    whistleText,
    cookMethod: recipe.cookMethod,
    ingredients,
    prerequisites,
    timeline,
    steps,
    chefTips: recipe.chefTips,
    stepTips,
  };
}
