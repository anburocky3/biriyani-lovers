import { Flame, Soup } from "lucide-react";

type VesselCardProps = {
  name: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
};

export function VesselCard({
  name,
  subtitle,
  selected,
  onClick,
}: VesselCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex w-full flex-col rounded-2xl border p-4 text-left shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md",
        selected
          ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200 dark:border-orange-500 dark:bg-orange-950/50 dark:ring-orange-900"
          : "border-gray-200 bg-white hover:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-orange-500",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-300">
        <Soup className="h-4 w-4 shrink-0" />
        <Flame className="h-4 w-4 shrink-0" />
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-slate-100">
        {name}
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
        {subtitle}
      </p>
    </button>
  );
}
