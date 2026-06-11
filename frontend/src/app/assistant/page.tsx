"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles, Trash2, BookOpen, FileText, Lightbulb, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatApi } from "@/lib/api";
import { useStore } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";
import { glowPulse } from "@/lib/animations";
import type { ChatMode, ChatMessage } from "@/types";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const MODES: { id: ChatMode; label: string; icon: typeof BookOpen; desc: string }[] = [
  { id: "general",   label: "Chat",      icon: MessageSquare, desc: "Ask anything" },
  { id: "explain",   label: "Explain",   icon: BookOpen,      desc: "Deep explanations" },
  { id: "summarize", label: "Summarize", icon: FileText,      desc: "Condense notes" },
  { id: "tips",      label: "Tips",      icon: Lightbulb,     desc: "Study strategies" },
];

const STARTERS = [
  "Explain the concept of spaced repetition",
  "How do I solve differential equations?",
  "Summarize the key points of photosynthesis",
  "Give me tips for memorizing organic chemistry",
];

export default function AssistantPage() {
  const { messages, chatMode, isTyping, sessionId,
          addMessage, setTyping, setChatMode, setSessionId, clearChat } = useStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (lastMsgRef.current && messages.at(-1)?.role === "assistant") {
      glowPulse(lastMsgRef.current);
    }
  }, [messages]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    addMessage(userMsg);
    setTyping(true);

    try {
      const resp = await chatApi.sendMessage({
        session_id: sessionId ?? undefined,
        message: content,
        mode: chatMode,
      });

      if (!sessionId) setSessionId(resp.session_id);

      const aiMsg: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: resp.reply,
        created_at: new Date().toISOString(),
        mode: chatMode,
      };
      addMessage(aiMsg);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to get response.");
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function handleClear() {
    if (sessionId) {
      try { await chatApi.clearSession(sessionId); } catch {}
    }
    clearChat();
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)]
                      flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-brand">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[var(--text-primary)]">AI Study Assistant</h1>
            <p className="text-xs text-[var(--text-muted)]">Powered by AI · Always learning with you</p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-raised)] rounded-xl p-1 border border-[var(--border)]">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setChatMode(mode.id)}
                title={mode.desc}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                  "transition-all duration-150",
                  chatMode === mode.id
                    ? "bg-brand-500 text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="btn-ghost text-xs flex items-center gap-1.5 text-rose-400 hover:bg-rose-400/10"
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand mx-auto flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="font-semibold text-[var(--text-primary)]">How can I help you study?</h2>
              <p className="text-sm text-[var(--text-muted)] max-w-xs">
                Ask me to explain a concept, summarize your notes, or give you study tips.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left p-3.5 rounded-xl border border-[var(--border)]
                             bg-[var(--bg-raised)] hover:border-brand-500/40
                             hover:bg-brand-500/5 transition-all duration-200 text-sm
                             text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          return (
            <div
              key={msg.id}
              ref={isLast && msg.role === "assistant" ? lastMsgRef : undefined}
              className={cn(
                "flex gap-3 animate-fade-up",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                msg.role === "assistant"
                  ? "bg-gradient-brand text-white"
                  : "bg-brand-500/15 text-brand-400"
              )}>
                {msg.role === "assistant" ? "✦" : "U"}
              </div>

              {/* Bubble */}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-brand-500 text-white rounded-tr-sm"
                  : "bg-[var(--bg-raised)] border border-[var(--border)] rounded-tl-sm"
              )}>
                {msg.role === "assistant" ? (
                  <div className="ai-prose text-[var(--text-primary)]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs text-white shrink-0">
              ✦
            </div>
            <div className="bg-[var(--bg-raised)] border border-[var(--border)] rounded-2xl rounded-tl-sm
                            px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="text-brand-400 animate-spin" />
              <span className="text-xs text-[var(--text-muted)]">StudyMind is thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 md:px-8 py-4 border-t border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`${MODES.find(m => m.id === chatMode)?.desc ?? "Ask anything"}… (Enter to send, Shift+Enter for newline)`}
              rows={1}
              className={cn(
                "input-base resize-none overflow-hidden leading-relaxed pr-3",
                "min-h-[44px] max-h-32"
              )}
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className={cn(
              "btn-primary p-3 rounded-xl shrink-0 transition-all",
              (!input.trim() || isTyping) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isTyping
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} />
            }
          </button>
        </div>
        <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
          AI can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  );
}
