"use client";

import { Bell, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { format } from "date-fns";

export default function TopBar() {
  const user = useStore((s) => s.user);

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
      {/* Left: greeting */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {getGreeting()}, {user?.full_name?.split(" ")[0] ?? "Student"} 👋
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {format(new Date(), "EEEE, MMMM d")}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button className="btn-ghost p-2 rounded-lg" title="Search">
          <Search size={16} />
        </button>
        <button className="btn-ghost p-2 rounded-lg relative" title="Notifications">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </button>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
