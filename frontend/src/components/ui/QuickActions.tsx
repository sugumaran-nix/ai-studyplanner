"use client";

import Link from "next/link";
import { BookOpen, BotMessageSquare, Upload, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  { label: "New Study Plan", href: "/planner",   icon: BookOpen,       color: "text-brand-400",   bg: "bg-brand-400/10",   border: "hover:border-brand-400/30" },
  { label: "Ask AI",         href: "/assistant", icon: BotMessageSquare,color: "text-violet-400", bg: "bg-violet-400/10",  border: "hover:border-violet-400/30" },
  { label: "Upload Notes",   href: "/planner",   icon: Upload,         color: "text-cyan-400",    bg: "bg-cyan-400/10",    border: "hover:border-cyan-400/30" },
  { label: "View Progress",  href: "/analytics", icon: BarChart3,      color: "text-emerald-400", bg: "bg-emerald-400/10", border: "hover:border-emerald-400/30" },
];

export default function QuickActions() {
  return (
    <div className="card p-6 h-full">
      <h2 className="font-semibold text-[var(--text-primary)] mb-5">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map(({ label, href, icon: Icon, color, bg, border }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex flex-col items-center gap-2.5 p-4 rounded-xl",
              "bg-[var(--bg-raised)] border border-[var(--border)]",
              "hover:shadow-card-hover transition-all duration-200",
              border
            )}
          >
            <div className={cn("p-2.5 rounded-xl", bg)}>
              <Icon size={18} className={color} />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)] text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
