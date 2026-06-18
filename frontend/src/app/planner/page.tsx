"use client";

import { useEffect, useRef, useState } from "react";
import { pageEnter, staggerCards } from "@/lib/animations";
import PlannerForm from "@/components/planner/PlannerForm";
import StudyPlanView from "@/components/planner/StudyPlanView";
import FileUploadZone from "@/components/planner/FileUploadZone";
import WeakTopicAnalyzer from "@/components/planner/WeakTopicAnalyzer";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tab = "generate" | "plan" | "upload" | "analyze";

export default function PlannerPage() {
  const { activePlan } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>("generate");
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageRef.current) pageEnter(pageRef.current);
  }, []);

  useEffect(() => {
    if (activePlan) setActiveTab("plan");
  }, [activePlan]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "generate", label: "✦ Generate Plan" },
    { id: "plan",     label: "📅 My Plan" },
    { id: "upload",   label: "📄 Upload Notes" },
    { id: "analyze",  label: "🔍 Analyze Weak Topics" },
  ];

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Study Planner</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          AI-generated schedules, spaced repetition, and weak-topic detection.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-raised)] rounded-xl w-fit border border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-brand-500 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "generate" && <PlannerForm onGenerated={() => setActiveTab("plan")} />}
        {activeTab === "plan"     && <StudyPlanView onNavigateToGenerate={() => setActiveTab("generate")} />}
        {activeTab === "upload"   && <FileUploadZone />}
        {activeTab === "analyze"  && <WeakTopicAnalyzer />}
      </div>
    </div>
  );
}
