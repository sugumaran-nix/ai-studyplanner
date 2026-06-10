"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Brain, BotMessageSquare,
  BarChart3, BookOpen, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Settings, Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { sidebarEnter } from "@/lib/animations";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
  { label: "Study Planner", href: "/planner", icon: BookOpen },
  { label: "AI Assistant",  href: "/assistant", icon: BotMessageSquare },
  { label: "Analytics",     href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme, user, clearAuth } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) sidebarEnter(ref.current);
  }, []);

  return (
    <aside
      ref={ref}
      className={cn(
        "relative flex flex-col h-screen border-r border-[var(--border)]",
        "bg-[var(--bg-surface)] transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
              StudyMind
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">AI Learning Assistant</span>
          </div>
        )}
      </div>

      {/* ── Nav items ──────────────────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                "transition-all duration-150 group relative",
                active
                  ? "bg-brand-500/12 text-brand-400"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0 transition-transform duration-150",
                  "group-hover:scale-110",
                  active && "text-brand-400"
                )}
              />
              {!collapsed && <span>{label}</span>}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom controls ─────────────────────────────────────────────── */}
      <div className="px-2 py-3 border-t border-[var(--border)] space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          className="btn-ghost w-full flex items-center gap-3 text-sm"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          )}
        </button>

        {/* User info */}
        {user && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            "bg-[var(--bg-raised)] mt-2"
          )}>
            <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs text-white font-semibold shrink-0">
              {user.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">
                  {user.email}
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={clearAuth}
                title="Sign out"
                className="p-1 rounded hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-rose-400 transition-colors"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Collapse toggle ──────────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full",
          "bg-[var(--bg-surface)] border border-[var(--border)]",
          "flex items-center justify-center text-[var(--text-muted)]",
          "hover:text-brand-400 hover:border-brand-500/40 transition-all duration-150",
          "shadow-card z-50"
        )}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
