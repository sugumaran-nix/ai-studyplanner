"use client";

import { useEffect, useRef } from "react";
import { Flame, Clock, CheckCircle2, Brain } from "lucide-react";
import { animateCounter } from "@/lib/animations";
import { cn } from "@/lib/utils";

const STATS = [
  {
    label: "Study Streak",
    value: 7,
    unit: "days",
    icon: Flame,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    decimals: 0,
  },
  {
    label: "Hours This Week",
    value: 14.5,
    unit: "hrs",
    icon: Clock,
    color: "text-brand-400",
    bg: "bg-brand-400/10",
    decimals: 1,
  },
  {
    label: "Sessions Done",
    value: 23,
    unit: "total",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    decimals: 0,
  },
  {
    label: "Topics Mastered",
    value: 41,
    unit: "topics",
    icon: Brain,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    decimals: 0,
  },
];

export default function StatsRow() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    STATS.forEach((stat, i) => {
      const el = refs.current[i];
      if (el) animateCounter(el, stat.value, 1.2, stat.decimals);
    });
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="card card-hover p-5 dash-card flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                {stat.label}
              </span>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <Icon size={15} className={stat.color} />
              </div>
            </div>
            <div className="flex items-end gap-1.5">
              <span
                ref={(el) => { refs.current[i] = el; }}
                className="text-3xl font-bold text-[var(--text-primary)] tabular-nums"
              >
                0
              </span>
              <span className="text-sm text-[var(--text-muted)] mb-0.5">
                {stat.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
