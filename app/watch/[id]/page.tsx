"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ArrowLeft, ExternalLink, CheckCircle2, Save, Target,
  ChevronLeft, ChevronRight, Star, FileText, RefreshCw, Bot,
} from "lucide-react";
import { cn, getYouTubeEmbedUrl, getYouTubeId } from "@/lib/utils";
import { VideoStatus, Video } from "@/types";

const STATUS_OPTIONS: { value: VideoStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "rewatch", label: "Rewatch" },
  { value: "skipped", label: "Skipped" },
];

// Map video category → notes-page category for visual consistency
function categoryForNote(video: Video): string {
  const c = video.category ?? "General";
  if (c === "Keepa") return "Keepa";
  if (c === "SellerAmp") return "SellerAmp";
  if (c === "Product Research") return "Product Research";
  if (c === "Sourcing") return "Product Research";
  if (c === "Risk Management") return "Risk Management";
  if (c === "Ungating") return "Risk Management";
  if (c === "Inventory" || c === "FBA Operations") return "Inventory Management";
  if (c === "Profit Math" || c === "Business") return "Strategy";
  if (c === "FBA Foundations") return "Amazon FBA Basics";
  return "General";
}

export default function WatchPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const videos = useStore((s) => s.videos);
  const updateVideo = useStore((s) => s.updateVideo);
  const notes = useStore((s) => s.notes);
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);

  const orderedSeeds = useMemo(
    () => videos
      .filter((v) => v.isSeeded && v.dayNumber)
      .sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0)),
    [videos],
  );

  const video = videos.find((v) => v.id === id);
  const currentIdx = orderedSeeds.findIndex((v) => v.id === id);
  const prevVideo = currentIdx > 0 ? orderedSeeds[currentIdx - 1] : null;
  const nextVideo = currentIdx >= 0 && currentIdx < orderedSeeds.length - 1 ? orderedSeeds[currentIdx + 1] : null;

  // Find the existing note for this video (if any)
  const existingNote = useMemo(
    () => video ? notes.find((n) => n.relatedVideoId === video.id) : undefined,
    [notes, video?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [noteText, setNoteText] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef<string | undefined>(existingNote?.id);

  // ─── AI Description state ───────────────────────────────────────────────
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fetchAttemptedRef = useRef<string | null>(null);

  const fetchAiDescription = useCallback(async (force = false) => {
    if (!video) return;
    if (!force && video.aiDescription) return;
    if (!force && fetchAttemptedRef.current === video.id) return;
    fetchAttemptedRef.current = video.id;

    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "describe_video",
          data: {
            title: video.title,
            channel: video.channel,
            url: video.link,
            category: video.category,
            dayNumber: video.dayNumber,
            weekNumber: video.weekNumber,
            whatItTeaches: video.whatItTeaches,
            whyIncluded: video.whyIncluded,
          },
        }),
      });
      const data = await res.json();
      if (data.description) {
        updateVideo(video.id, { aiDescription: data.description });
      } else if (data.error) {
        setAiError(data.error);
      } else {
        setAiError("No description returned");
      }
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setAiLoading(false);
    }
  }, [video, updateVideo]);

  // Auto-fetch description on first visit (only if not already cached)
  useEffect(() => {
    if (!video) return;
    if (!video.aiDescription && !aiLoading) {
      fetchAiDescription(false);
    }
  }, [video?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hydrate text when video/note loads
  useEffect(() => {
    if (!video) return;
    setNoteText(existingNote?.detailedNotes ?? video.mainIdea ?? "");
    noteIdRef.current = existingNote?.id;
  }, [video?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep noteIdRef in sync if a note is later created or deleted
  useEffect(() => {
    noteIdRef.current = existingNote?.id;
  }, [existingNote?.id]);

  const saveNote = useCallback((text: string) => {
    if (!video) return;
    const trimmed = text.trim();

    // If the existing note has an id, update it (or delete if empty)
    if (noteIdRef.current) {
      updateNote(noteIdRef.current, {
        detailedNotes: text,
        title: video.title,
        category: categoryForNote(video),
        subcategory: video.dayNumber ? `Day ${video.dayNumber}` : (video.isBonus ? "Bonus" : ""),
        relatedVideoId: video.id,
      });
      setSavedAt(Date.now());
      return;
    }

    // No existing note — create one only when there's something to save
    if (trimmed.length > 0) {
      addNote({
        title: video.title,
        category: categoryForNote(video),
        subcategory: video.dayNumber ? `Day ${video.dayNumber}` : (video.isBonus ? "Bonus" : ""),
        date: new Date().toISOString().split("T")[0],
        mainIdea: video.mainIdea ?? "",
        detailedNotes: text,
        keyLesson: "",
        mistakesToAvoid: "",
        actionSteps: video.practiceTask ?? "",
        relatedVideoId: video.id,
        relatedProductId: "",
        tags: video.tags?.filter((t) => !["critical", "core", "supporting"].includes(t)) ?? [],
        confidenceScore: video.confidenceScore ?? 5,
        needReview: false,
      });
      setSavedAt(Date.now());
    }
  }, [video, addNote, updateNote]);

  const scheduleSave = useCallback((text: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(text), 800);
  }, [saveNote]);

  function handleNoteChange(value: string) {
    setNoteText(value);
    scheduleSave(value);
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
  const isPracticeDay = !video.link && [
    "Practice", "Action", "Strategy", "Planning",
    "Profit Math", "Business", "FBA Operations",
  ].includes(video.category ?? "");
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
                  <CheckCircle2 className="h-3 w-3" /> saved to Notes
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
        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
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
                    No video today. Use this day to apply what you&apos;ve learned. The task is below.
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

            {/* AI Description */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-cyan-500/5 border border-violet-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-widest text-violet-600 dark:text-violet-300 font-bold flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5" /> Description
                </div>
                {video.aiDescription && !aiLoading && (
                  <button
                    onClick={() => fetchAiDescription(true)}
                    className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
                    title="Regenerate description"
                  >
                    <RefreshCw className="h-3 w-3" /> regenerate
                  </button>
                )}
              </div>

              {aiLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating description…
                </div>
              ) : video.aiDescription ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {video.aiDescription}
                </div>
              ) : aiError ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Couldn&apos;t generate AI description.{" "}
                    {aiError.toLowerCase().includes("credit") && (
                      <span>Your Anthropic account needs credits.</span>
                    )}
                  </p>
                  {video.whatItTeaches && (
                    <p className="text-sm leading-relaxed pt-2 border-t border-violet-500/20">
                      {video.whatItTeaches}
                    </p>
                  )}
                  <button
                    onClick={() => fetchAiDescription(true)}
                    className="text-xs text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 mt-2"
                  >
                    <RefreshCw className="h-3 w-3" /> Try again
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {video.whatItTeaches ?? "No description available."}
                </p>
              )}
            </div>

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

          {/* ─── RIGHT: One-big-notes sidebar ─── */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="card-soft p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </span>
                  Notes
                </h2>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {savedRecently ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> saved to Notes
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" /> auto-save
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Type freely. Saves automatically into your{" "}
                <Link href="/notes" className="underline hover:text-foreground">Notes page</Link>{" "}
                — linked to this video forever.
              </p>

              <textarea
                value={noteText}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder={
                  "Capture what you learned. Some prompts to get started:\n\n" +
                  "• What's the one big idea?\n" +
                  "• What rule will you apply?\n" +
                  "• What mistake will you avoid?\n" +
                  "• What's your next action?\n"
                }
                rows={18}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition resize-y leading-relaxed"
              />

              {existingNote && (
                <Link
                  href="/notes"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <FileText className="h-3 w-3" /> View in Notes page
                </Link>
              )}
            </div>

            {/* Confidence rating */}
            <div className="card-soft p-5">
              <label className="text-xs font-bold mb-2 flex items-center gap-1.5">
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
