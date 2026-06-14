"use client";

import { useEffect, useRef } from "react";
import { staggerCards, animateCounter } from "@/lib/animations";
import StatsRow from "@/components/analytics/StatsRow";
import TodayScheduleCard from "@/components/planner/TodayScheduleCard";
import AIRecommendationsPanel from "@/components/assistant/AIRecommendationsPanel";
import RecentActivityFeed from "@/components/analytics/RecentActivityFeed";
import QuickActions from "@/components/ui/QuickActions";

export default function DashboardPage() {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardsRef.current) {
      staggerCards(".dash-card", 0.07);
    }
  }, []);

  return (
    <div ref={cardsRef} className="max-w-7xl mx-auto space-y-6">
      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <StatsRow />

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's schedule — spans 2 cols */}
        <div className="xl:col-span-2 dash-card">
          <TodayScheduleCard />
        </div>

        {/* AI recommendations — 1 col */}
        <div className="dash-card">
          <AIRecommendationsPanel />
        </div>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dash-card">
          <QuickActions />
        </div>
        <div className="dash-card">
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}
