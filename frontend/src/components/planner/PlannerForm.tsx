"use client";

import { useState } from "react";
import { Plus, X, Loader2, Sparkles, CalendarDays, Clock, Target } from "lucide-react";
import { plannerApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { PlannerFormData } from "@/types";
import toast from "react-hot-toast";

interface Props {
  onGenerated: () => void;
}

const DIFFICULTY_OPTIONS = [
  { value: "light",     label: "Light",     desc: "Relaxed pace, more breaks" },
  { value: "balanced",  label: "Balanced",  desc: "Recommended — steady progress" },
  { value: "intensive", label: "Intensive", desc: "Maximum coverage, exam-crunch mode" },
] as const;

// BUG FIX: compute today's date string at call time (not at module load)
// so it stays accurate if the user keeps the page open across midnight.
function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

// Max date = 1 year from today
function getMaxDateStr(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split("T")[0];
}

export default function PlannerForm({ onGenerated }: Props) {
  const { setActivePlan } = useStore();
  const [loading, setLoading] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [weakInput, setWeakInput] = useState("");

  const [form, setForm] = useState<PlannerFormData>({
    subjects: [],
    exam_date: "",
    daily_hours: 4,
    difficulty_preference: "balanced",
    weak_subjects: [],
  });

  function addSubject() {
    const s = subjectInput.trim();
    if (!s || form.subjects.includes(s)) return;
    setForm((f) => ({ ...f, subjects: [...f.subjects, s] }));
    setSubjectInput("");
  }

  function removeSubject(s: string) {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.filter((x) => x !== s),
      // BUG FIX: also remove from weak_subjects when the parent subject is deleted.
      // Previously, removing a subject left stale entries in weak_subjects that
      // would be sent to the backend — causing confusing AI plan output.
      weak_subjects: f.weak_subjects.filter((x) => x !== s),
    }));
  }

  function addWeak() {
    const s = weakInput.trim();
    if (!s || form.weak_subjects.includes(s) || !form.subjects.includes(s)) return;
    setForm((f) => ({ ...f, weak_subjects: [...f.weak_subjects, s] }));
    setWeakInput("");
  }

  // BUG FIX: pressing PageDown / ArrowDown on a <input type="number"> can push
  // the value below the configured minimum (browsers apply large page-jumps).
  // We intercept those keys and manually clamp the value instead.
  function handleHoursKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const MIN = 0.5;
    const MAX = 16;
    const STEP = 0.5;

    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      setForm((f) => ({
        ...f,
        daily_hours: Math.max(MIN, parseFloat((f.daily_hours - STEP).toFixed(1))),
      }));
    }
    if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      setForm((f) => ({
        ...f,
        daily_hours: Math.min(MAX, parseFloat((f.daily_hours + STEP).toFixed(1))),
      }));
    }
  }

  async function handleSubmit() {
    if (form.subjects.length === 0) {
      toast.error("Add at least one subject.");
      return;
    }
    if (!form.exam_date) {
      toast.error("Please set your exam date.");
      return;
    }

    // BUG FIX: validate exam date client-side before sending.
    // The HTML `min` attribute can be bypassed by typing a date manually.
    // Also handles timezone edge cases (user in IST, server in UTC).
    const today = getTodayStr();
    if (form.exam_date <= today) {
      toast.error("Exam date must be tomorrow or later. Please choose a future date.");
      return;
    }

    // BUG FIX: clamp daily_hours to safe bounds in case of manual text input
    const clampedHours = Math.min(16, Math.max(0.5, form.daily_hours || 0.5));
    if (clampedHours !== form.daily_hours) {
      setForm((f) => ({ ...f, daily_hours: clampedHours }));
    }

    setLoading(true);
    try {
      const plan = await plannerApi.generate({ ...form, daily_hours: clampedHours });
      setActivePlan(plan);
      toast.success("Study plan generated! 🎉");
      onGenerated();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div className="lg:col-span-3 card p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)] text-lg">
            Create Your Study Plan
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Fill in your details and let AI build a personalized schedule.
          </p>
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <label className="label flex items-center gap-2">
            <Target size={12} /> Subjects
          </label>
          <div className="flex gap-2">
            <input
              className="input-base flex-1"
              placeholder="e.g. Mathematics, Physics…"
              value={subjectInput}
              onChange={(e) => setSubjectInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubject()}
            />
            <button onClick={addSubject} className="btn-primary px-3">
              <Plus size={16} />
            </button>
          </div>
          {form.subjects.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.subjects.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
                             bg-brand-500/12 text-brand-400 border border-brand-500/20"
                >
                  {s}
                  <button onClick={() => removeSubject(s)} className="hover:text-rose-400 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Exam date + daily hours */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <CalendarDays size={12} /> Exam Date
            </label>
            <input
              type="date"
              className="input-base"
              min={getTodayStr()}
              max={getMaxDateStr()}
              value={form.exam_date}
              onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))}
            />
            {form.exam_date && form.exam_date <= getTodayStr() && (
              <p className="text-xs text-rose-400">
                ⚠ Please choose a date after today.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <Clock size={12} /> Daily Hours
            </label>
            <div className="relative">
              <input
                type="number"
                min={0.5}
                max={16}
                step={0.5}
                className="input-base pr-10"
                value={form.daily_hours}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setForm((f) => ({
                    ...f,
                    // BUG FIX: clamp immediately on change so NaN / negative
                    // values never persist in state.
                    daily_hours: isNaN(val) ? 0.5 : Math.min(16, Math.max(0.5, val)),
                  }));
                }}
                onKeyDown={handleHoursKeyDown}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                hrs
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="label">Study Intensity</label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setForm((f) => ({ ...f, difficulty_preference: opt.value }))
                }
                className={cn(
                  "p-3 rounded-xl border text-left transition-all duration-200",
                  form.difficulty_preference === opt.value
                    ? "border-brand-500/60 bg-brand-500/10"
                    : "border-[var(--border)] bg-[var(--bg-raised)] hover:border-brand-500/30"
                )}
              >
                <p className={cn(
                  "text-sm font-semibold",
                  form.difficulty_preference === opt.value
                    ? "text-brand-400"
                    : "text-[var(--text-primary)]"
                )}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Weak subjects */}
        {form.subjects.length > 0 && (
          <div className="space-y-2">
            <label className="label">Weak Subjects (Optional)</label>
            <p className="text-xs text-[var(--text-muted)]">
              These get extra sessions and earlier scheduling.
            </p>
            <div className="flex gap-2">
              <select
                className="input-base flex-1"
                value={weakInput}
                onChange={(e) => setWeakInput(e.target.value)}
              >
                <option value="">Select a subject…</option>
                {form.subjects
                  .filter((s) => !form.weak_subjects.includes(s))
                  .map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
              </select>
              <button onClick={addWeak} className="btn-primary px-3">
                <Plus size={16} />
              </button>
            </div>
            {form.weak_subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {form.weak_subjects.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs
                               bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  >
                    ⚠ {s}
                    <button
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          weak_subjects: f.weak_subjects.filter((x) => x !== s),
                        }))
                      }
                      className="hover:text-rose-400"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              AI is building your plan…
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Study Plan
            </>
          )}
        </button>
      </div>

      {/* ── Tips sidebar ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card p-5 bg-gradient-subtle border-brand-500/20">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-brand-400" />
            How StudyMind AI Works
          </h3>
          <ul className="space-y-2.5 text-xs text-[var(--text-secondary)]">
            {[
              "Analyzes your subjects and time available",
              "Distributes topics using cognitive load theory",
              "Schedules weak areas earlier with more repetitions",
              "Builds spaced repetition intervals automatically",
              "Adds mock tests and revision days near the exam",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400
                                 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            💡 <strong className="text-[var(--text-secondary)]">Pro tip:</strong> The more
            specific your subjects (e.g. "Organic Chemistry" instead of "Chemistry"), the
            more targeted your plan will be.
          </p>
        </div>
      </div>
    </div>
  );
}
