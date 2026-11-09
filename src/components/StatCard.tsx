import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
  trend?: string;
  colorScheme: "blue" | "emerald" | "amber" | "rose" | "purple";
}

const colorMap = {
  blue: {
    bg: "from-sky-500/10 to-indigo-500/5",
    border: "border-sky-500/20",
    text: "text-sky-400",
    iconBg: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  },
  emerald: {
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  amber: {
    bg: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    text: "text-amber-400",
    iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  },
  rose: {
    bg: "from-rose-500/10 to-pink-500/5",
    border: "border-rose-500/20",
    text: "text-rose-400",
    iconBg: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  },
  purple: {
    bg: "from-purple-500/10 to-indigo-500/5",
    border: "border-purple-500/20",
    text: "text-purple-400",
    iconBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme,
}) => {
  const scheme = colorMap[colorScheme];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${scheme.bg} p-6 border ${scheme.border} bg-neutral-900/60 shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${scheme.iconBg}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-neutral-400">{description}</p>
    </div>
  );
};

