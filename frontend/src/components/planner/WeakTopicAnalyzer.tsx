"use client";

import { useState } from "react";
import { analyzerApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn, priorityBg } from "@/lib/utils";
import { Brain, Loader2, TrendingDown, TrendingUp, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";
import type { WeakTopic } from "@/types";

export default function WeakTopicAnalyzer() {
  const { setAnalysis, lastAnalysis } = useStore();
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (text.trim().length < 50) {
      toast.error("Please enter at least 50 characters of notes.");
      return;
    }
    setLoading(true);
    try {
      const result = await analyzerApi.analyzeText({ text, subject: subject || undefined });
      setAnalysis(result);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message ?? "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)]">Weak Topic Analyzer</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Paste your study notes and AI will identify knowledge gaps and prioritize them.
          </p>
        </div>

        <div className="space-y-2">
          <label className="label">Subject (optional)</label>
          <input
            className="input-base"
            placeholder="e.g. Organic Chemistry"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="label">Your Study Notes</label>
          <textarea
            className="input-base min-h-[260px] resize-none font-mono text-xs leading-relaxed"
            placeholder="Paste your notes here…&#10;&#10;e.g. 'Aldol condensation involves the reaction of an enol or enolate with a carbonyl compound to form a β-hydroxy carbonyl compound…'"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs text-[var(--text-muted)] text-right">
            {text.length} characters
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || text.length < 50}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
          ) : (
            <><Brain size={16} /> Analyze My Notes</>
          )}
        </button>
      </div>

      {/* Results */}
      <div>
        {lastAnalysis ? (
          <AnalysisResults />
        ) : (
          <div className="card p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
            <Brain size={32} className="text-[var(--border)] mb-3" />
            <p className="text-sm text-[var(--text-muted)]">
              Paste your notes and click Analyze to see AI insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisResults() {
  const { lastAnalysis } = useStore();
  if (!lastAnalysis) return null;

  const readiness = lastAnalysis.overall_readiness;
  const readinessColor =
    readiness >= 70 ? "text-emerald-400" : readiness >= 45 ? "text-amber-400" : "text-rose-400";

  return (
    <div className="space-y-4">
      {/* Readiness score */}
      <div className="card p-5 flex items-center gap-5">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-raised)" strokeWidth="6" />
            <circle
              cx="32" cy="32" r="26" fill="none"
              stroke={readiness >= 70 ? "#10b981" : readiness >= 45 ? "#f59e0b" : "#f43f5e"}
              strokeWidth="6"
              strokeDasharray={`${(readiness / 100) * 163} 163`}
              strokeLinecap="round"
            />
          </svg>
          <span className={cn("absolute inset-0 flex items-center justify-center text-sm font-bold", readinessColor)}>
            {Math.round(readiness)}%
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Overall Readiness</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {readiness >= 70 ? "Looking good! Focus on weak areas." : readiness >= 45 ? "Needs work in key areas." : "Significant gaps detected."}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            ~{lastAnalysis.estimated_review_hours}h review recommended
          </p>
        </div>
      </div>

      {/* Weak topics */}
      {lastAnalysis.weak_topics.length > 0 && (
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <TrendingDown size={13} className="text-rose-400" /> Weak Topics
          </h3>
          <div className="space-y-3">
            {lastAnalysis.weak_topics.map((topic, i) => (
              <WeakTopicRow key={i} topic={topic} />
            ))}
          </div>
        </div>
      )}

      {/* Strong topics */}
      {lastAnalysis.strong_topics.length > 0 && (
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <TrendingUp size={13} className="text-emerald-400" /> Strong Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {lastAnalysis.strong_topics.map((t, i) => (
              <span key={i} className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvement plan */}
      {lastAnalysis.improvement_plan.length > 0 && (
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3 flex items-center gap-2">
            <Lightbulb size={13} className="text-brand-400" /> Improvement Plan
          </h3>
          <ol className="space-y-2">
            {lastAnalysis.improvement_plan.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="w-4 h-4 rounded-full bg-brand-500/15 text-brand-400 flex items-center
                                 justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function WeakTopicRow({ topic }: { topic: WeakTopic }) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round(topic.confidence_score * 100);

  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-raised)] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-[var(--text-primary)] truncate">{topic.topic}</p>
            <span className={cn("badge text-[10px]", priorityBg(topic.priority))}>
              {topic.priority}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  pct >= 70 ? "bg-emerald-400" : pct >= 45 ? "bg-amber-400" : "bg-rose-400"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)] shrink-0">{pct}%</span>
          </div>
        </div>
      </button>

      {expanded && topic.suggestions.length > 0 && (
        <div className="px-3 pb-3 border-t border-[var(--border)] pt-2.5 bg-[var(--bg-raised)]">
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase mb-2">
            Suggestions
          </p>
          <ul className="space-y-1">
            {topic.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                <span className="text-brand-400 shrink-0">→</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
