"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Beaker,
  BookHeart,
  Circle,
  CircleCheckBig,
  ChefHat,
  Drumstick,
  Leaf,
  Clock3,
  MoonStar,
  Sparkles,
  Sun,
  UtensilsCrossed,
  Users,
  Wheat,
} from "lucide-react";
import { VesselCard } from "@/app/components/vessel-card";
import {
  type ProteinType,
  type LanguageCode,
  type RecipePlan,
  type RiceUnit,
  type VesselKey,
  generateRecipePlan,
  getRecipeCopy,
  toRiceMl,
  vesselKeys,
  vesselRecipes,
} from "@/app/lib/biriyani";

type FavoriteRecipe = {
  id: string;
  timestamp: string;
  vessel: VesselKey;
  proteinType: ProteinType;
  riceMl: number;
  people: number;
};

const FAVORITES_KEY = "biriyani-lovers:favorites";
const THEME_KEY = "biriyani-lovers:dark-mode";

export default function Home() {
  const [selectedVessel, setSelectedVessel] = useState<VesselKey>("cooker");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [riceQuantity, setRiceQuantity] = useState("1");
  const [riceUnit, setRiceUnit] = useState<RiceUnit>("glass");
  const [people, setPeople] = useState("");
  const [proteinType, setProteinType] = useState<ProteinType>("chicken");
  const [cookerMode, setCookerMode] = useState<"whistle" | "no-whistle">(
    "whistle",
  );
  const [plan, setPlan] = useState<RecipePlan | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [highlightSteps, setHighlightSteps] = useState(false);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const stepsRef = useRef<HTMLDivElement | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.lang = language === "ta" ? "ta" : "en";
  }, [language]);

  const onGenerate = () => {
    const parsedRice = Number.parseFloat(riceQuantity);
    const parsedPeople = Number.parseInt(people, 10);

    const nextPlan = generateRecipePlan({
      vessel: selectedVessel,
      riceQuantity: Number.isNaN(parsedRice) ? 0 : parsedRice,
      riceUnit,
      people: Number.isNaN(parsedPeople) ? undefined : parsedPeople,
      proteinType,
      language,
      cookerMode,
    });

    setPlan(nextPlan);
    setCompletedSteps([]);
    // Scroll to the cooking steps and flash highlight
    setTimeout(() => {
      // prefer the steps block; fall back to the whole output section
      const target = stepsRef.current ?? outputRef.current;
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightSteps(true);
        setTimeout(() => setHighlightSteps(false), 1200);
      }
    }, 50);
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((value) => value !== index)
        : [...prev, index],
    );
  };

  const saveFavorite = () => {
    if (!plan) return;

    const nextFavorite: FavoriteRecipe = {
      id: `${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      vessel: selectedVessel,
      proteinType,
      riceMl: plan.riceMl,
      people: plan.people,
    };

    setFavorites((prev) => [nextFavorite, ...prev].slice(0, 8));
  };

  const pageTheme = darkMode
    ? "bg-slate-950 text-slate-100"
    : "bg-gradient-to-b from-gray-50 via-orange-50 to-yellow-50 text-gray-900";

  const cardTheme = darkMode
    ? "border-slate-700/80 bg-slate-900/80"
    : "border-orange-100/80 bg-white/90";

  const sectionTitle = useMemo(
    () =>
      plan ? `${plan.vesselLabel} Recipe Ready` : "Pick vessel and generate",
    [plan],
  );

  const isTamil = language === "ta";

  const ricePreview = useMemo(() => {
    const parsedRice = Number.parseFloat(riceQuantity);

    if (Number.isNaN(parsedRice) || parsedRice <= 0) {
      return riceUnit === "glass"
        ? "Enter a glass count to see the ml conversion."
        : "Enter ml to see the glass equivalent.";
    }

    const convertedMl = toRiceMl(parsedRice, riceUnit);
    const convertedGlass = convertedMl / 180;

    return riceUnit === "glass"
      ? `${parsedRice} glass = ${Math.round(convertedMl)} ml`
      : `${Math.round(convertedMl)} ml = ${convertedGlass.toFixed(convertedGlass % 1 === 0 ? 0 : 1)} glass`;
  }, [riceQuantity, riceUnit]);

  const proteinOptions = [
    {
      key: "veg" as const,
      label: isTamil ? "சைவம்" : "Veg",
      description: isTamil ? "காய்கறி + பன்னீர்" : "Vegetable mix + paneer",
      dotClass: "bg-green-500",
      activeClass:
        "border-green-400 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-950/50 dark:text-green-200",
      icon: <Leaf className="h-4 w-4" />,
    },
    {
      key: "beef" as const,
      label: isTamil ? "பீஃப்" : "Beef",
      description: isTamil ? "4 விசில் பரிந்துரை" : "4 whistles recommended",
      dotClass: "bg-amber-700",
      activeClass:
        "border-amber-400 bg-amber-100 text-amber-700 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-200",
      icon: <ChefHat className="h-4 w-4" />,
    },
    {
      key: "chicken" as const,
      label: isTamil ? "சிக்கன்" : "Chicken",
      description: isTamil ? "2 விசில் பரிந்துரை" : "2 whistles recommended",
      dotClass: "bg-orange-500",
      activeClass:
        "border-orange-400 bg-orange-100 text-orange-700 dark:border-orange-500 dark:bg-orange-950/60 dark:text-orange-200",
      icon: <Drumstick className="h-4 w-4" />,
    },
    {
      key: "mutton" as const,
      label: isTamil ? "மட்டன்" : "Mutton",
      description: isTamil ? "4 விசில் பரிந்துரை" : "4 whistles recommended",
      dotClass: "bg-red-500",
      activeClass:
        "border-red-400 bg-red-100 text-red-700 dark:border-red-500 dark:bg-red-950/60 dark:text-red-200",
      icon: <ChefHat className="h-4 w-4" />,
    },
  ];

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 ${pageTheme} ${darkMode ? "dark" : ""} ${isTamil ? "font-tamil" : ""}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl" />
      </div>

      <main className="stagger-children relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section
          className={`animate-enter rounded-3xl border p-6 shadow-sm transition-all duration-300 ${cardTheme}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-orange-600">
                  {isTamil ? "தென்னிந்திய பாணி" : "South Indian Style"}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setLanguage((prev) => (prev === "en" ? "ta" : "en"))
                  }
                  className="rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm transition hover:scale-105 dark:border-slate-700 dark:bg-slate-800 dark:text-orange-200"
                  aria-label="Toggle language"
                >
                  {isTamil ? "English" : "தமிழ்"}
                </button>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {isTamil ? "பிரியாணி லவ்வர்ஸ் 🍗" : "Biriyani Lovers 🍗"}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base dark:text-slate-300">
                {isTamil
                  ? "தவறுகள் இல்லாமல் சிறப்பான பிரியாணி சமைக்கவும். பாத்திரத்துக்கேற்ற பொருட்கள், தண்ணீர் அளவு, மற்றும் படிகள் உடனே கிடைக்கும்."
                  : "Cook perfect biriyani without mistakes. Get vessel-aware ingredients, water ratio, and cooking steps instantly."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800 dark:text-yellow-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <MoonStar className="h-4 w-4" />
              )}
            </button>
          </div>
        </section>

        <section
          ref={outputRef}
          className={`animate-enter rounded-3xl border p-5 shadow-sm transition-all duration-300 ${cardTheme}`}
        >
          <h2 className="mb-4 text-lg font-semibold">
            {isTamil
              ? "🍲 உங்கள் பாத்திரத்தை தேர்வு செய்யவும்"
              : "🍲 Choose Your Vessel"}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {vesselKeys.map((key) => {
              const recipe = getRecipeCopy(key, language);
              return (
                <VesselCard
                  key={key}
                  name={recipe.label}
                  subtitle={recipe.subtitle}
                  selected={selectedVessel === key}
                  onClick={() => setSelectedVessel(key)}
                />
              );
            })}
          </div>
        </section>

        <section
          className={`animate-enter rounded-3xl border p-5 shadow-sm transition-all duration-300 ${cardTheme}`}
        >
          <h2 className="mb-4 text-lg font-semibold">
            {isTamil ? "🧪 உள்ளீட்டு பகுதி" : "🧪 Input Section"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 gap-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {isTamil ? "பாத்திர வகை" : "Vessel Type"}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-300">
                {isTamil
                  ? "சமைக்கும் பாத்திரத்தைத் தேர்ந்தெடுத்து முறை மற்றும் தண்ணீர் அளவை தானாக மாற்றவும்."
                  : "Select your cooking vessel to auto-adjust method and water ratio."}
              </span>
              <select
                value={selectedVessel}
                onChange={(event) =>
                  setSelectedVessel(event.target.value as VesselKey)
                }
                className="rounded-2xl border border-gray-200 bg-white p-3 text-sm shadow-sm outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-800"
              >
                {vesselKeys.map((key) => (
                  <option key={key} value={key}>
                    {vesselRecipes[key].label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <Beaker className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                {isTamil ? "அரிசி அளவு" : "Rice Quantity"}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-300">
                {isTamil
                  ? "கிளாஸ் அல்லது மில்லி அளவில் தேர்வு செய்யவும். 1 கிளாஸ் = 180 மில்லி."
                  : "Choose unit in glass or ml. 1 glass = 180 ml."}
              </span>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_108px] sm:items-stretch">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={riceQuantity}
                  onChange={(event) => setRiceQuantity(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-800"
                  aria-label="Rice quantity"
                />
                <select
                  value={riceUnit}
                  onChange={(event) =>
                    setRiceUnit(event.target.value as RiceUnit)
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-3 text-sm shadow-sm outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-800"
                  aria-label="Rice unit"
                >
                  <option value="glass">glass</option>
                  <option value="ml">ml</option>
                </select>
              </div>
              <span className="text-xs font-medium text-orange-600 dark:text-orange-300">
                {ricePreview}
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">
                {isTamil
                  ? "நபர்கள் எண்ணிக்கை (விருப்பம்)"
                  : "Number of People (optional)"}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-300">
                {isTamil
                  ? "அரிசி அளவு ஏற்கனவே உள்ளீட்டுச் செய்தால் இதை காலியாக விடலாம்."
                  : "Leave blank if you already entered rice quantity."}
              </span>
              <input
                type="number"
                min="1"
                value={people}
                onChange={(event) => setPeople(event.target.value)}
                placeholder={isTamil ? "உதாரணம்: 4" : "Example: 4"}
                className="rounded-2xl border border-gray-200 bg-white p-3 text-sm shadow-sm outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          </div>

          <div>
            <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
              <span className="text-sm font-medium">
                {isTamil ? "இறைச்சி வகை" : "Protein Type"}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-300">
                {isTamil
                  ? "சிக்கன் அல்லது மட்டன் தேர்வின் படி விசில் மற்றும் சமைக்கும் நேரம் மாறும்."
                  : "Choose chicken or mutton to adjust whistles and cooking time."}
              </span>
              <div className="grid gap-2 sm:grid-cols-4">
                {proteinOptions.map((option) => {
                  const selected = proteinType === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setProteinType(option.key)}
                      className={`flex flex-col items-start gap-2 rounded-2xl border p-3 text-left text-sm font-medium transition ${
                        selected
                          ? option.activeClass
                          : "border-gray-200 bg-white text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                      aria-pressed={selected}
                      aria-label={`Select ${option.label}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full ${option.dotClass}`}
                        />
                        {option.icon}
                        <span>{option.label}</span>
                      </span>
                      <span className="text-xs font-normal text-gray-500 dark:text-slate-300">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                <label className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {isTamil ? "குக்கர் முறை" : "Cooker Mode"}
                  </span>
                  <select
                    value={cookerMode}
                    onChange={(e) =>
                      setCookerMode(e.target.value as "whistle" | "no-whistle")
                    }
                    className="ml-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="whistle">Whistle (use cooker)</option>
                    <option value="no-whistle">
                      No whistle (low-heat dum)
                    </option>
                  </select>
                </label>
              </div>
            </label>
          </div>

          <div className="mt-5 flex flex-col justify-center items-center gap-3">
            <button
              type="button"
              onClick={onGenerate}
              className="flex  items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-orange-600 w-full text-center"
            >
              <Sparkles className="h-4 w-4 text-yellow-100" />
              <span className="ml-4">
                {isTamil ? "பிரியாணி உருவாக்கவும்" : "Generate Recipe"}
              </span>
            </button>

            <button
              type="button"
              onClick={saveFavorite}
              disabled={!plan}
              className="inline-flex items-center gap-2 rounded-2xl border border-yellow-300 bg-yellow-100 px-5 py-3 text-sm font-semibold text-yellow-800 transition-all duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200"
            >
              <BookHeart className="h-4 w-4" />
              {isTamil ? "பிடித்ததை சேமிக்கவும்" : "Save Favorite"}
            </button>
          </div>
        </section>

        <section
          className={`animate-enter rounded-3xl border p-5 shadow-sm transition-all duration-300 ${cardTheme}`}
        >
          <h2 className="mb-4 text-lg font-semibold">
            {isTamil ? "📋 வெளியீட்டு பகுதி" : "📋 Output Section"}
          </h2>
          <p className="mb-4 text-sm text-gray-600 dark:text-slate-300">
            {isTamil
              ? "உங்கள் தேர்வுகளின் அடிப்படையில் தயாராக உள்ளது"
              : sectionTitle}
          </p>

          {plan ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <article
                className="rounded-2xl border border-orange-200 bg-linear-to-br from-orange-50 to-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2"
                ref={stepsRef}
              >
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
                  <CircleCheckBig className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  {isTamil ? "🔖 முன் தேவை" : "🔖 Prerequisite Card"}
                </h3>

                <div className="space-y-3">
                  {plan.prerequisites.map((item) => (
                    <div
                      key={`${item.timeLabel}-${item.title}`}
                      className="rounded-2xl border border-orange-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70"
                    >
                      <div className="flex flex-wrap items-start gap-3">
                        <span className="inline-flex shrink-0 items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                          {item.timeLabel}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                            {item.details}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.spices.map((spice) => (
                              <span
                                key={spice}
                                className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200"
                              >
                                {spice}
                              </span>
                            ))}
                          </div>

                          <p className="mt-3 text-xs font-medium text-orange-700 dark:text-orange-300">
                            {item.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:col-span-2">
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
                  <Clock3 className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  {isTamil ? "⏱️ நேர வரிசை" : "⏱️ Timeline View"}
                </h3>

                <div className="relative space-y-4 pl-5">
                  <div className="absolute left-2.75 top-2 bottom-2 w-px bg-orange-200 dark:bg-slate-700" />
                  {plan.timeline.map((item) => (
                    <div
                      key={`${item.timeLabel}-${item.title}`}
                      className="relative"
                    >
                      <span className="absolute -left-4.75 top-2 h-3 w-3 rounded-full border-2 border-orange-500 bg-white dark:border-orange-300 dark:bg-slate-900" />
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                        <div className="flex flex-wrap items-start gap-3">
                          <span className="inline-flex shrink-0 items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-orange-500">
                            {item.timeLabel}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {item.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                              {item.details}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.spices.map((spice) => (
                                <span
                                  key={spice}
                                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                                >
                                  {spice}
                                </span>
                              ))}
                            </div>

                            <p className="mt-3 text-xs font-medium text-orange-700 dark:text-orange-300">
                              {item.tip}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article
                className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
                  highlightSteps
                    ? "ring-4 ring-orange-300/30 animate-pulse"
                    : ""
                }`}
              >
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
                  <Wheat className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  {isTamil ? "🍚 பொருட்கள்" : "🍚 Ingredients"}
                </h3>

                <div className="space-y-2 text-sm">
                  {plan.ingredients.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800/60"
                    >
                      <p className="font-medium text-gray-900 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-gray-600 dark:text-slate-300">
                        {item.quantity}
                      </p>
                      {item.note ? (
                        <p className="text-xs text-gray-500">{item.note}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
                  <UtensilsCrossed className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  {isTamil ? "🔥 சமைக்கும் படிகள்" : "🔥 Cooking Steps"}
                </h3>

                <div className="space-y-2">
                  {plan.steps.map((step, index) => {
                    const isDone = completedSteps.includes(index);
                    return (
                      <button
                        key={step}
                        type="button"
                        onClick={() => toggleStep(index)}
                        aria-pressed={isDone}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-all duration-300 ${
                          isDone
                            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200"
                            : "border-orange-100 bg-orange-50 text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-300">
                          {isDone ? (
                            <CircleCheckBig className="h-4 w-4 text-green-600 dark:text-green-300" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </span>
                        <span
                          className={
                            isDone ? "line-through decoration-green-500/70" : ""
                          }
                        >
                          {step}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
                  <Users className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  {isTamil ? "முன் கணிப்பு" : "Smart Output"}
                </h3>

                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <p className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                    {isTamil
                      ? `நபர்கள்: ${plan.people}`
                      : `Serves: ${plan.people}`}
                  </p>
                  <p className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                    {isTamil
                      ? `அரிசி: ${Math.round(plan.riceMl)} மில்லி`
                      : `Rice: ${Math.round(plan.riceMl)} ml`}
                  </p>
                  <p className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                    {isTamil
                      ? `தண்ணீர்: ${plan.waterText}`
                      : `Water: ${plan.waterText}`}
                  </p>
                  <p className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800">
                    {isTamil
                      ? `முறை: ${plan.cookMethod}`
                      : `Method: ${plan.cookMethod}`}
                  </p>
                  <p className="rounded-xl bg-gray-50 p-3 dark:bg-slate-800 sm:col-span-2">
                    {isTamil
                      ? `விசில்: ${plan.whistleText}`
                      : `Whistle: ${plan.whistleText}`}
                  </p>
                </div>
              </article>

              <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="mb-3 inline-flex items-center gap-2 text-base font-semibold">
                  <ChefHat className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  {isTamil ? "💡 சமையல் குறிப்புகள்" : "💡 Chef Tips"}
                </h3>
                <div className="space-y-3 text-sm text-gray-700 dark:text-slate-200">
                  {plan.chefTips.map((tip) => (
                    <p
                      key={tip}
                      className="rounded-xl bg-yellow-50 p-3 dark:bg-slate-800"
                    >
                      {tip}
                    </p>
                  ))}
                </div>
              </article>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-orange-200 p-4 text-sm text-gray-500">
              {isTamil
                ? "அரிசி அளவு அல்லது நபர்கள் எண்ணிக்கையை உள்ளிடி, பாத்திரத்தைத் தேர்ந்தெடுத்து, பிரியாணி உருவாக்கவும்."
                : "Enter rice quantity or number of people, choose vessel, and press Generate Recipe."}
            </p>
          )}
        </section>

        <section
          className={`animate-enter rounded-3xl border p-5 shadow-sm transition-all duration-300 ${cardTheme}`}
        >
          <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold">
            <Drumstick className="h-4 w-4 text-orange-600 dark:text-orange-300" />
            {isTamil ? "பிடித்தவை" : "Favorites"}
          </h2>

          {favorites.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-300">
              {isTamil
                ? "இதுவரை பிடித்தவை இல்லை. அதிகம் பயன்படுத்தும் ரெசிபிகளை சேமிக்கவும்."
                : "No favorites yet. Save your most-used recipe combinations."}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 text-sm shadow-sm transition hover:scale-[1.01] dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="font-semibold text-gray-900 dark:text-slate-100">
                    {vesselRecipes[item.vessel].label}
                  </p>
                  <p className="text-gray-600 dark:text-slate-300">
                    {item.proteinType === "veg"
                      ? "Veg"
                      : item.proteinType === "chicken"
                        ? "Chicken"
                        : item.proteinType === "mutton"
                          ? "Mutton"
                          : "Beef"}{" "}
                    • {item.people} people
                  </p>
                  <p className="text-gray-600 dark:text-slate-300">
                    Rice: {item.riceMl} ml
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                    {item.timestamp}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
