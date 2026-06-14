"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, CheckCircle2, X, Sparkles, BookOpen } from "lucide-react";
import { filesApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { FileAnalysis } from "@/types";
import toast from "react-hot-toast";

export default function FileUploadZone() {
  const { setFileAnalysis, lastFileAnalysis } = useStore();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setUploading(true);
      setUploadedFile(file.name);
      try {
        const result = await filesApi.upload(file);
        setFileAnalysis(result);
        toast.success("Notes analyzed successfully!");
      } catch (err: any) {
        toast.error(err.message ?? "Upload failed.");
        setUploadedFile(null);
      } finally {
        setUploading(false);
      }
    },
    [setFileAnalysis]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload area */}
      <div className="space-y-4">
        <h2 className="font-semibold text-[var(--text-primary)]">Upload Study Notes</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Upload a PDF or text file. AI will extract key topics, summarize content, and
          identify weak areas.
        </p>

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer",
            "transition-all duration-200",
            isDragActive
              ? "border-brand-500 bg-brand-500/8"
              : "border-[var(--border)] hover:border-brand-500/50 hover:bg-brand-500/4",
            uploading && "opacity-60 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-brand-400 animate-spin" />
              <p className="text-sm text-[var(--text-secondary)]">
                Analyzing <strong>{uploadedFile}</strong>…
              </p>
              <p className="text-xs text-[var(--text-muted)]">AI is extracting insights</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-3">
              <Upload size={36} className="text-brand-400" />
              <p className="text-sm font-medium text-brand-400">Drop your file here!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center">
                <FileText size={28} className="text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Drag & drop your notes here
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  or click to browse · PDF, TXT · max 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analysis results */}
      <div>
        {lastFileAnalysis ? (
          <FileAnalysisResults analysis={lastFileAnalysis} />
        ) : (
          <div className="card p-8 flex flex-col items-center justify-center text-center h-full min-h-[280px]">
            <Sparkles size={32} className="text-[var(--border)] mb-3" />
            <p className="text-sm text-[var(--text-muted)]">
              Upload a file to see AI analysis here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FileAnalysisResults({ analysis }: { analysis: FileAnalysis }) {
  const [tab, setTab] = useState<"summary" | "topics" | "flashcards">("summary");

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {analysis.filename}
          </span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">
          {analysis.word_count.toLocaleString()} words
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-raised)] rounded-lg p-1 border border-[var(--border)]">
        {(["summary", "topics", "flashcards"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
              tab === t
                ? "bg-brand-500 text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-80">
        {tab === "summary" && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {analysis.summary}
            </p>
            {analysis.weak_areas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-400 mb-2">⚠ Weak Areas Detected</p>
                <ul className="space-y-1">
                  {analysis.weak_areas.map((w, i) => (
                    <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === "topics" && (
          <div className="flex flex-wrap gap-2">
            {analysis.key_topics.map((t, i) => (
              <span key={i} className="badge bg-brand-500/10 text-brand-400 border-brand-500/20 text-xs">
                {t}
              </span>
            ))}
          </div>
        )}

        {tab === "flashcards" && (
          <div className="space-y-3">
            {analysis.flashcard_suggestions.map((card, i) => (
              <div key={i} className="bg-[var(--bg-raised)] rounded-xl p-3.5 border border-[var(--border)]">
                <p className="text-xs font-semibold text-brand-400 mb-1.5">Q: {card.question}</p>
                <p className="text-xs text-[var(--text-secondary)]">A: {card.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
