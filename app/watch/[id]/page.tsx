"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ArrowLeft, ExternalLink, CheckCircle2, Play, Save, Clock,
  Target, Lightbulb, AlertTriangle, Sparkles, ListTodo,
  ChevronLeft, ChevronRight, Star,
} from "lucide-react";
import { cn, getYouTubeEmbedUrl, getYouTubeId } from "@/lib/utils";
import { VideoStatus } from "@/types";

const STATUS_OPTIONS: { value: VideoStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "rewatch", label: "Rewatch" },
  { value: "skipped", label: "Skipped" },
];

type NoteField = "mainIdea" | "keyTakeaways" | "timestampNotes" | "rulesLearned" | "mistakesToAvoid" | "actionItems";

const NOTE_FIELDS: { key: NoteField; label: string; placeholder: string; icon: React.ComponentType<{ className?: string }>; hue: string }[] = [
  {
    key: "mainIdea",
    label: "Main Idea",
    placeholder: "In one sentence, what is this video really teaching?",
    icon: Lightbulb,
    hue: "from-amber-400 to-orange-500",
  },
  {
    key: "keyTakeaways",
    label: "Key Takeaways",
    placeholder: "The 3-5 things you don't want to forget.\n\n1. \n2. \n3. ",
    icon: Sparkles,
    hue: "from-violet-400 to-fuchsia-500",
  },
  {
    key: "timestampNotes",
    label: "Timestamp Notes",
    placeholder: "0:00 — Intro\n2:30 — First key point\n5:14 — That part you'll forget without writing down",
    icon: Clock,
    hue: "from-indigo-400 to-blue-500",
  },
  {
    key: "rulesLearned",
    label: "Rules / Heuristics",
    placeholder: "Specific rules to apply later, e.g.\n- Skip if Amazon is in stock >70%\n- Buy box must be stable for 30+ days",
    icon: Target,
    hue: "from-emerald-400 to-teal-500",
  },
  {
    key: "mistakesToAvoid",
    label: "Mistakes to Avoid",
    placeholder: "What this video warns against. Specific failure modes.",
    icon: AlertTriangle,
    hue: "from-rose-400 to-red-500",
  },
  {
    key: "actionItems",
    label: "Action Items",
    placeholder: "What will you DO with this knowledge? Be specific.",
    icon: ListTodo,
    hue: "from-cyan-400 to-blue-500",
  },
];

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const videos = useStore((s) => s.videos);
  const updateVideo = useStore((s) => s.updateVideo);

  // Sorted index of seeded curriculum videos for prev/next nav
  const orderedSeeds = React.useMemo(
    () => videos
      .filter((v) => v.isSeeded && v.dayNumber)
      .sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0)),
    [videos],
  );

  const video = videos.find((v) => v.id === id);
  const currentIdx = orderedSeeds.findIndex((v) => v.id === id);
  const prevVideo = currentIdx > 0 ? orderedSeeds[currentIdx - 1] : null;
  const nextVideo = currentIdx >= 0 && currentIdx < orderedSeeds.length - 1 ? orderedSeeds[currentIdx + 1] : null;

  const [notes, setNotes] = useState<Record<NoteField, string>>({
    mainIdea: "",
    keyTakeaways: "",
    timestampNotes: "",
    rulesLearned: "",
    mistakesToAvoid: "",
    actionItems: "",
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate notes from store when video loads/changes
  useEffect(() => {
    if (!video) return;
    setNotes({
      mainIdea: video.mainIdea ?? "",
      keyTakeaways: video.keyTakeaways ?? "",
      timestampNotes: video.timestampNotes ?? "",
      rulesLearned: video.rulesLearned ?? "",
      mistakesToAvoid: video.mistakesToAvoid ?? "",
      actionItems: video.actionItems ?? "",
    });
  }, [video?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveAll = useCallback((newNotes: Record<NoteField, string>) => {
    if (!video) return;
    updateVideo(video.id, newNotes);
    setSavedAt(Date.now());
  }, [video, updateVideo]);

  const scheduleSave = useCallback((newNotes: Record<NoteField, string>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveAll(newNotes), 800);
  }, [saveAll]);

  function handleNoteChange(key: NoteField, value: string) {
    const next = { ...notes, [key]: value };
    setNotes(next);
    scheduleSave(next);
  }

  function handleStatusChange(status: VideoStatus) {
    if (!video) return;
    updateVideo(video.id, {
      status,
      ...(status === "completed" ? { dateWatched: new Date().toISOString() } : {}),
    });
  }

  function handleRating(rating: number) {
    if (!video) return;
    updateVideo(video.id, { rating });
  }

  // ─── Video not found ──────────────────────────────────────────────────────
  if (!video) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">Video not found</h1>
        <p className="text-muted-foreground mb-6">
          The video you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link
          href="/videos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Link>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(video.link);
  const ytId = getYouTubeId(video.link);
  const isCritical = video.tags?.includes("critical");
  const isCore = video.tags?.includes("core");
  const isPracticeDay = !video.link && (video.category === "Practice" || video.category === "Action" || video.category === "Strategy" || video.category === "Planning" || video.category === "Profit Math" || video.category === "Business" || video.category === "FBA Operations");
  const savedRecently = savedAt && Date.now() - savedAt < 2000;

  return (
    <div className="min-h-screen">
      {/* ─── Sticky top bar ─── */}
      <div className="sticky top-0 z-30 glass border-b border-border">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/videos")}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-lg hover:bg-muted transition"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Library</span>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {video.dayNumber && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white">
                  DAY {video.dayNumber}
                </span>
              )}
              {video.weekNumber && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  W{video.weekNumber}
                </span>
              )}
              {isCritical && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                  ★ CRITICAL
                </span>
              )}
              {isCore && !isCritical && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                  CORE
                </span>
              )}
              {savedRecently && (
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-1">
                  <CheckCircle2 className="h-3 w-3" /> saved
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-bold truncate">{video.title}</h1>
          </div>

          <select
            value={video.status}
            onChange={(e) => handleStatusChange(e.target.value as VideoStatus)}
            className="text-xs sm:text-sm px-2 py-1.5 rounded-lg border border-border bg-card cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        {/* ─── Main 2-column layout ─── */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* ─── LEFT: Player + context ─── */}
          <div className="space-y-5">
            {/* Player */}
            {embedUrl ? (
              <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-xl ring-1 ring-border">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : isPracticeDay ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center p-8 text-white text-center shadow-xl">
                <div>
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <h2 className="text-2xl lg:text-3xl font-black mb-2">Practice Day</h2>
                  <p className="text-white/90 max-w-md mx-auto">
                    No video today. Use this day to apply what you&apos;ve learned. The task is in the sidebar →
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted flex items-center justify-center p-8 text-center">
                <div>
                  <ExternalLink className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">This isn&apos;t an embeddable YouTube link.</p>
                  {video.link && (
                    <a
                      href={video.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
                    >
                      Open original <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Below-player metadata strip */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-medium">{video.channel}</p>
                <p className="text-xs text-muted-foreground">
                  {video.category} · <span className="capitalize">{video.difficulty}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => handleRating(i)}
                      aria-label={`Rate ${i} stars`}
                      className="p-0.5 hover:scale-110 transition"
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          i <= (video.rating ?? 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                  ))}
                </div>
                {video.link && ytId && (
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" /> YouTube
                  </a>
                )}
              </div>
            </div>

            {/* Why included */}
            {video.whyIncluded && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border border-violet-500/20">
                <div className="text-[10px] uppercase tracking-widest text-violet-600 dark:text-violet-300 font-bold mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Why this video
                </div>
                <p className="text-sm leading-relaxed">{video.whyIncluded}</p>
              </div>
            )}

            {/* What it teaches */}
            {video.whatItTeaches && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20">
                <div className="text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-300 font-bold mb-1.5 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" /> What it teaches
                </div>
                <p className="text-sm leading-relaxed">{video.whatItTeaches}</p>
              </div>
            )}

            {/* Practice task — the action */}
            {video.practiceTask && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30">
                <div className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold mb-1.5 flex items-center gap-1">
                  <Target className="h-3 w-3" /> Today&apos;s task
                </div>
                <p className="text-sm leading-relaxed font-medium">{video.practiceTask}</p>
                <label className="mt-3 flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!video.practiceCompleted}
                    onChange={(e) => updateVideo(video.id, { practiceCompleted: e.target.checked })}
                    className="rounded"
                  />
                  <span>Mark task as done</span>
                </label>
              </div>
            )}

            {/* Prev / Next nav */}
            <div className="flex items-center justify-between gap-2 pt-2">
              {prevVideo ? (
                <Link
                  href={`/watch/${prevVideo.id}`}
                  className="group flex-1 p-3 rounded-xl border border-border hover:border-violet-400 hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                    <ChevronLeft className="h-3 w-3" /> Day {prevVideo.dayNumber}
                  </div>
                  <div className="text-sm font-medium line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                    {prevVideo.title}
                  </div>
                </Link>
              ) : <div className="flex-1" />}

              {nextVideo ? (
                <Link
                  href={`/watch/${nextVideo.id}`}
                  className="group flex-1 p-3 rounded-xl border border-border hover:border-violet-400 hover:bg-muted/50 transition text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-0.5">
                    Day {nextVideo.dayNumber} <ChevronRight className="h-3 w-3" />
                  </div>
                  <div className="text-sm font-medium line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                    {nextVideo.title}
                  </div>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </div>

          {/* ─── RIGHT: Notes sidebar ─── */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="card-soft p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </span>
                  Your Notes
                </h2>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {savedRecently ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> auto-saved
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" /> auto-save
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Type freely — saves as you write. Notes stay attached to this video forever.
              </p>

              <div className="space-y-4">
                {NOTE_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-bold mb-1.5 flex items-center gap-1.5">
                      <span className={cn("w-5 h-5 rounded-md bg-gradient-to-br flex items-center justify-center", field.hue)}>
                        <field.icon className="h-3 w-3 text-white" />
                      </span>
                      {field.label}
                    </label>
                    <textarea
                      value={notes[field.key]}
                      onChange={(e) => handleNoteChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={field.key === "keyTakeaways" || field.key === "timestampNotes" ? 4 : 2}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition resize-y"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence rating */}
            <div className="card-soft p-5">
              <label className="text-xs font-bold mb-2 block flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                Confidence (1–10): how well did this stick?
              </label>
              <input
                type="range"
                min={0}
                max={10}
                value={video.confidenceScore ?? 0}
                onChange={(e) => updateVideo(video.id, { confidenceScore: +e.target.value })}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>Lost</span>
                <span className="font-bold text-foreground text-sm">{video.confidenceScore ?? 0}/10</span>
                <span>Could teach it</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
