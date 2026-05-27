"use client";
import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Video, VideoStatus, VideoDifficulty, VideoSourceType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BookOpen, CheckCircle2, RotateCcw, Plus, ExternalLink, ChevronDown, ChevronUp,
  Brain, Target, Star, Zap, TrendingUp, AlertCircle, Calendar, Search,
  PlayCircle, BarChart2, Sparkles, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "FBA Foundations", "Profit Math", "Keepa", "SellerAmp",
  "Sourcing", "Strategy", "Risk Management", "Ungating",
  "FBA Operations", "Inventory", "Business", "Action",
  "Planning", "Practice", "Bonus",
];

const SOURCE_TYPES: VideoSourceType[] = [
  "YouTube Video", "YouTube Playlist", "YouTube Channel",
  "Official Tool Page", "Official Amazon Training", "Official Amazon Help",
  "Article", "Practice Day",
];

const ALL_TAGS = [
  "Keepa", "Buy Box", "Sales Rank", "Rank Drops", "Offer Count", "FBA Sellers",
  "Amazon In Stock", "90 Day Average", "Price Tanking", "SellerAmp", "ROI",
  "Profit", "Max Cost", "Restrictions", "IP Risk", "Wholesale", "Supplier Sheets",
  "Price List Analyzer", "SmartScout", "Competitors", "Brands", "Seller Map",
  "Inventory", "Restock", "FBA Shipment", "InventoryLab",
];

const STATUS_OPTIONS: { value: VideoStatus; label: string }[] = [
  { value: "not_started", label: "Not Started" },
  { value: "watching", label: "Watching" },
  { value: "completed", label: "Completed" },
  { value: "rewatch", label: "Rewatch" },
  { value: "skipped", label: "Skipped" },
  { value: "archived", label: "Archived" },
];

const WEEK_INFO: Record<number, { title: string; goal: string; colorClass: string; bgClass: string }> = {
  1: { title: "Foundations", goal: "Understand the FBA arbitrage model end-to-end before drowning in tools.", colorClass: "text-pink-700 dark:text-pink-300", bgClass: "bg-pink-50 dark:bg-pink-900/20 border-pink-200" },
  2: { title: "Master Keepa", goal: "Build the single most valuable skill in arbitrage: reading charts.", colorClass: "text-violet-700 dark:text-violet-300", bgClass: "bg-violet-50 dark:bg-violet-900/20 border-violet-200" },
  3: { title: "SellerAmp & Product Research", goal: "Layer SellerAmp on top of Keepa for a complete analysis flow.", colorClass: "text-cyan-700 dark:text-cyan-300", bgClass: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200" },
  4: { title: "Sourcing & Scale", goal: "Turn theory into real sourcing reps, first buys, and a 90-day plan.", colorClass: "text-amber-700 dark:text-amber-300", bgClass: "bg-amber-50 dark:bg-amber-900/20 border-amber-200" },
};

const TAB_ITEMS = [
  { id: "plan", label: "30-Day Plan" },
  { id: "all", label: "All Resources" },
  { id: "keepa", label: "Keepa" },
  { id: "selleramp", label: "SellerAmp" },
  { id: "sourcing", label: "Sourcing" },
  { id: "operations", label: "Operations" },
  { id: "practice", label: "Practice Days" },
  { id: "rewatch", label: "Rewatch List" },
  { id: "completed", label: "Completed" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sourceTypeBadgeVariant(st?: string) {
  if (!st) return "muted" as const;
  if (st.includes("YouTube")) return "destructive" as const;
  if (st.includes("Amazon")) return "warning" as const;
  if (st === "Official Tool Page") return "info" as const;
  if (st === "Article") return "default" as const;
  if (st === "Practice Day") return "success" as const;
  return "muted" as const;
}

function checklistCount(cl?: Video["dailyChecklist"]): [number, number] {
  if (!cl) return [0, 6];
  const vals = Object.values(cl);
  return [vals.filter(Boolean).length, vals.length];
}

const EMPTY_VIDEO = (): Omit<Video, "id" | "createdAt"> => ({
  title: "", link: "", channel: "", category: "Keepa Basics",
  difficulty: "beginner", status: "not_started", rating: 0,
  keyTakeaways: "", timestampNotes: "", actionItems: "", relatedSkill: "",
  dateWatched: "", needRewatch: false, tags: [], isSeeded: false,
  sourceType: "YouTube Video", whyIncluded: "", whatItTeaches: "",
  practiceTask: "", isBonus: false, confidenceScore: 0,
  mainIdea: "", rulesLearned: "", mistakesToAvoid: "",
  practiceCompleted: false, needsAIReview: false,
  dailyChecklist: { watchedVideo: false, tookNotes: false, addedTakeaways: false, completedPracticeTask: false, addedConfidence: false, markedRewatch: false },
});

// ─── ResourceCard ─────────────────────────────────────────────────────────────

function ResourceCard({ video, onStatusChange, onViewDetails, onEdit }: {
  video: Video;
  onStatusChange: (id: string, status: VideoStatus) => void;
  onViewDetails: (v: Video) => void;
  onEdit: (v: Video) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [done, done_total] = checklistCount(video.dailyChecklist);
  const pct = done_total > 0 ? Math.round((done / done_total) * 100) : 0;
  const hasDetails = video.whyIncluded || video.whatItTeaches || video.practiceTask;

  return (
    <Card className={cn(
      "transition-all hover:shadow-md flex flex-col",
      video.status === "completed" && "border-green-300",
      video.status === "rewatch" && "border-orange-300",
      video.status === "watching" && "border-blue-300",
      video.isBonus && "border-dashed",
      video.sourceType === "Practice Day" && "bg-green-50/30 dark:bg-green-900/10",
    )}>
      <CardContent className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          {video.dayNumber && (
            <Badge className="text-xs bg-blue-600 text-white hover:bg-blue-700">Day {video.dayNumber}</Badge>
          )}
          {video.weekNumber && (
            <Badge variant="muted" className="text-xs">W{video.weekNumber}</Badge>
          )}
          {video.tags?.includes("critical") && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm">
              ★ CRITICAL
            </span>
          )}
          {video.tags?.includes("core") && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm">
              CORE
            </span>
          )}
          {video.isBonus && <Badge variant="warning" className="text-xs">Bonus</Badge>}
          <div className="ml-auto flex gap-1 flex-wrap justify-end">
            <Badge
              variant={video.difficulty === "beginner" ? "success" : video.difficulty === "intermediate" ? "warning" : "destructive"}
              className="text-xs"
            >
              {video.difficulty}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{video.title}</h3>
        <p className="text-xs text-muted-foreground">{video.channel} · {video.category}</p>

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 4).map(t => (
              <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground">{t}</span>
            ))}
            {video.tags.length > 4 && <span className="text-xs text-muted-foreground">+{video.tags.length - 4}</span>}
          </div>
        )}

        {/* Status + Rating */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={video.status} onValueChange={v => onStatusChange(video.id, v as VideoStatus)}>
            <SelectTrigger className="h-7 text-xs w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {video.status === "completed" && video.rating > 0 && (
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={cn("h-3 w-3", i <= video.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
              ))}
            </div>
          )}
          {video.practiceCompleted && <Badge variant="success" className="text-xs h-5">✓ Practice</Badge>}
        </div>

        {/* Expandable details */}
        {hasDetails && (
          <div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Hide details" : "Why & practice task"}
            </button>
            {expanded && (
              <div className="mt-2 space-y-2 text-xs">
                {video.whyIncluded && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-0.5">Why included:</p>
                    <p>{video.whyIncluded}</p>
                  </div>
                )}
                {video.whatItTeaches && (
                  <div>
                    <p className="font-medium text-muted-foreground mb-0.5">What it teaches:</p>
                    <p>{video.whatItTeaches}</p>
                  </div>
                )}
                {video.practiceTask && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-800">
                    <p className="font-medium text-blue-700 dark:text-blue-300 mb-0.5">Practice task:</p>
                    <p className="text-blue-800 dark:text-blue-200">{video.practiceTask}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Checklist progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Daily checklist</span>
            <span>{done}/{done_total}</span>
          </div>
          <Progress value={pct} className="h-1.5" indicatorClassName={pct === 100 ? "bg-green-500" : undefined} />
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 mt-auto">
          <Link href={`/watch/${video.id}`} className="flex-1">
            <Button size="sm" className="h-7 text-xs w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white border-0">
              <PlayCircle className="h-3 w-3" /> Watch
            </Button>
          </Link>
          {video.link && (
            <a href={video.link} target="_blank" rel="noopener noreferrer" title="Open on YouTube">
              <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => onEdit(video)}>
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── ThirtyDayPlanView ────────────────────────────────────────────────────────

function ThirtyDayPlanView({ videos, onStatusChange, onViewDetails, onEdit }: {
  videos: Video[];
  onStatusChange: (id: string, status: VideoStatus) => void;
  onViewDetails: (v: Video) => void;
  onEdit: (v: Video) => void;
}) {
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [showBonus, setShowBonus] = useState(false);

  const mainVideos = videos.filter(v => !v.isBonus && v.dayNumber);
  const bonusVideos = videos.filter(v => v.isBonus);

  const byWeek = useMemo(() => {
    const map: Record<number, Record<number, Video[]>> = {};
    mainVideos.forEach(v => {
      const w = v.weekNumber ?? 0;
      const d = v.dayNumber ?? 0;
      if (!map[w]) map[w] = {};
      if (!map[w][d]) map[w][d] = [];
      map[w][d].push(v);
    });
    return map;
  }, [mainVideos]);

  function toggleWeek(w: number) {
    setOpenWeeks(prev => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w); else next.add(w);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(wNum => {
        const info = WEEK_INFO[wNum];
        const weekDays = byWeek[wNum] ?? {};
        const weekVideos = Object.values(weekDays).flat();
        const completed = weekVideos.filter(v => v.status === "completed").length;
        const isOpen = openWeeks.has(wNum);

        return (
          <Card key={wNum} className={cn("border", info.bgClass)}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleWeek(wNum)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-700 text-white shrink-0">Week {wNum}</Badge>
                  <div>
                    <p className={cn("font-semibold text-sm", info.colorClass)}>{info.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{info.goal}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground">{completed}/{weekVideos.length}</span>
                  <Progress value={weekVideos.length > 0 ? (completed / weekVideos.length) * 100 : 0} className="w-20 h-1.5" />
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            </CardHeader>
            {isOpen && (
              <CardContent className="pt-0 pb-3">
                <div className="space-y-1.5">
                  {Object.entries(weekDays).sort(([a], [b]) => +a - +b).map(([, dayVids]) =>
                    dayVids.map(v => (
                      <div key={v.id} className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border transition-colors",
                        v.status === "completed" ? "bg-green-50 dark:bg-green-900/10 border-green-200" :
                        v.status === "watching" ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200" :
                        v.status === "rewatch" ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200" :
                        "bg-card border-border"
                      )}>
                        <Badge className="text-xs shrink-0 bg-blue-600 text-white w-14 text-center justify-center">Day {v.dayNumber}</Badge>
                        {v.sourceType === "Practice Day"
                          ? <Brain className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          : v.sourceType?.includes("YouTube")
                          ? <PlayCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          : <BookOpen className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        }
                        <p className="text-xs font-medium flex-1 min-w-0 truncate">{v.title}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Select value={v.status} onValueChange={s => onStatusChange(v.id, s as VideoStatus)}>
                            <SelectTrigger className="h-6 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Link href={`/watch/${v.id}`} title="Watch + take notes">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-violet-600"><PlayCircle className="h-3.5 w-3.5" /></Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Bonus */}
      <Card className="border-dashed">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowBonus(b => !b)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="warning">Bonus</Badge>
              <p className="font-semibold text-sm">Bonus Resources ({bonusVideos.length})</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{bonusVideos.filter(v => v.status === "completed").length}/{bonusVideos.length} done</span>
              {showBonus ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </CardHeader>
        {showBonus && (
          <CardContent className="pt-0 pb-3">
            <div className="space-y-1.5">
              {bonusVideos.map(v => (
                <div key={v.id} className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border",
                  v.status === "completed" ? "bg-green-50 dark:bg-green-900/10 border-green-200" : "bg-card border-border"
                )}>
                  <Badge variant="warning" className="text-xs shrink-0">Bonus</Badge>
                  <p className="text-xs font-medium flex-1 min-w-0 truncate">{v.title}</p>
                  <Badge variant="muted" className="text-xs hidden sm:inline-flex shrink-0">{v.category}</Badge>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select value={v.status} onValueChange={s => onStatusChange(v.id, s as VideoStatus)}>
                      <SelectTrigger className="h-6 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Link href={`/watch/${v.id}`} title="Watch + take notes">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-violet-600"><PlayCircle className="h-3.5 w-3.5" /></Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── VideoDetailDialog ────────────────────────────────────────────────────────

function VideoDetailDialog({ video, onClose, onSave }: {
  video: Video | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Video>) => void;
}) {
  const [form, setForm] = useState<Partial<Video>>({});

  React.useEffect(() => {
    if (video) setForm({ ...video });
  }, [video]);

  if (!video) return null;

  function update(field: keyof Video, val: unknown) {
    setForm(f => ({ ...f, [field]: val }));
  }

  function updateChecklist(key: keyof NonNullable<Video["dailyChecklist"]>, val: boolean) {
    setForm(f => ({
      ...f,
      dailyChecklist: { ...(f.dailyChecklist ?? video!.dailyChecklist ?? { watchedVideo: false, tookNotes: false, addedTakeaways: false, completedPracticeTask: false, addedConfidence: false, markedRewatch: false }), [key]: val },
    }));
  }

  const cl = form.dailyChecklist ?? video.dailyChecklist;

  return (
    <Dialog open={!!video} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base leading-tight pr-6">{video.title}</DialogTitle>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {video.dayNumber && <Badge className="text-xs bg-blue-600 text-white">Day {video.dayNumber}</Badge>}
            {video.weekNumber && <Badge variant="muted" className="text-xs">Week {video.weekNumber}</Badge>}
            {video.isBonus && <Badge variant="warning" className="text-xs">Bonus</Badge>}
            <Badge variant={sourceTypeBadgeVariant(video.sourceType)} className="text-xs">{video.sourceType}</Badge>
            {video.link && (
              <a href={video.link} target="_blank" rel="noopener noreferrer">
                <Badge variant="info" className="text-xs cursor-pointer hover:opacity-80">Open Resource ↗</Badge>
              </a>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {(video.whyIncluded || video.whatItTeaches) && (
            <div className="space-y-1.5 text-sm bg-muted/50 rounded-lg p-3">
              {video.whyIncluded && <div><span className="font-medium">Why included: </span>{video.whyIncluded}</div>}
              {video.whatItTeaches && <div><span className="font-medium">Teaches: </span>{video.whatItTeaches}</div>}
            </div>
          )}

          {video.practiceTask && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1"><Target className="h-3 w-3" /> Practice Task</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">{video.practiceTask}</p>
              <div className="mt-2 flex items-center gap-2">
                <input type="checkbox" id="pc" checked={form.practiceCompleted ?? false}
                  onChange={e => update("practiceCompleted", e.target.checked)} className="rounded" />
                <label htmlFor="pc" className="text-xs text-blue-700 dark:text-blue-300 cursor-pointer">Mark practice as completed</label>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div>
            <p className="text-sm font-semibold mb-2">Daily Completion Checklist</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {([
                ["watchedVideo", "Watched the video/resource"],
                ["tookNotes", "Took notes"],
                ["addedTakeaways", "Added 3+ key takeaways"],
                ["completedPracticeTask", "Completed the practice task"],
                ["addedConfidence", "Added confidence score"],
                ["markedRewatch", "Marked rewatch if needed"],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input type="checkbox" checked={cl?.[key] ?? false}
                    onChange={e => updateChecklist(key, e.target.checked)} className="rounded" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Status, Confidence, Rating */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={form.status ?? video.status} onValueChange={v => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Confidence (0-10)</Label>
              <Input type="number" min={0} max={10} value={form.confidenceScore ?? 0}
                onChange={e => update("confidenceScore", +e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button key={i} onClick={() => update("rating", i)}>
                  <Star className={cn("h-5 w-5 transition-colors", i <= (form.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground hover:text-yellow-300")} />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          {([
            ["mainIdea", "Main Idea", "The core concept from this resource..."],
            ["keyTakeaways", "Key Takeaways", "• Takeaway 1\n• Takeaway 2\n• Takeaway 3"],
            ["timestampNotes", "Timestamp Notes", "0:00 - Introduction\n3:45 - Key concept"],
            ["rulesLearned", "Rules I Learned", "Rules or formulas from this resource..."],
            ["mistakesToAvoid", "Mistakes to Avoid", "Common errors this resource warned about..."],
            ["actionItems", "Action Steps", "Things I will do after watching this..."],
          ] as const).map(([field, labelText, placeholder]) => (
            <div key={field} className="space-y-1">
              <Label className="text-xs">{labelText}</Label>
              <Textarea
                value={(form[field] as string) ?? ""}
                onChange={e => update(field, e.target.value)}
                rows={field === "keyTakeaways" || field === "timestampNotes" ? 3 : 2}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(video.id, form); onClose(); }}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AddEditDialog ────────────────────────────────────────────────────────────

function AddEditDialog({ open, editingVideo, onClose, onSave, onDelete }: {
  open: boolean;
  editingVideo: Video | null;
  onClose: () => void;
  onSave: (data: Omit<Video, "id" | "createdAt">) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState<Omit<Video, "id" | "createdAt">>(EMPTY_VIDEO());
  const [analyzeUrl, setAnalyzeUrl] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState("");
  const [tagInput, setTagInput] = useState("");

  React.useEffect(() => {
    if (editingVideo) {
      const { id: _id, createdAt: _ca, ...rest } = editingVideo;
      setForm({ ...EMPTY_VIDEO(), ...rest });
    } else {
      setForm(EMPTY_VIDEO());
    }
    setAnalyzeMsg("");
    setAnalyzeUrl("");
  }, [editingVideo, open]);

  function update(field: keyof typeof form, val: unknown) {
    setForm(f => ({ ...f, [field]: val }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) update("tags", [...form.tags, t]);
    setTagInput("");
  }

  async function analyzeResource() {
    if (!analyzeUrl.trim() && !form.title.trim()) return;
    setAnalyzeLoading(true);
    setAnalyzeMsg("");
    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze_video", data: { url: analyzeUrl || form.link, title: form.title } }),
      });
      const data = await res.json();
      if (data.result) {
        const r = data.result;
        setForm(f => ({
          ...f,
          link: analyzeUrl || f.link,
          category: r.category ?? f.category,
          difficulty: r.difficulty ?? f.difficulty,
          sourceType: r.sourceType ?? f.sourceType,
          tags: r.tags ?? f.tags,
          whyIncluded: r.whyIncluded ?? f.whyIncluded,
          whatItTeaches: r.whatItTeaches ?? f.whatItTeaches,
          practiceTask: r.practiceTask ?? f.practiceTask,
          needsAIReview: r.confidence === "low",
        }));
        setAnalyzeMsg(r.confidence === "low"
          ? "⚠️ Low confidence — AI estimated from title only. Review all fields carefully."
          : r.confidence === "medium"
          ? "✓ Medium confidence — fields auto-filled. Please verify."
          : "✓ Fields auto-filled. Looks good.");
      } else {
        setAnalyzeMsg("⚠️ Could not analyze. Configure ANTHROPIC_API_KEY or fill fields manually.");
      }
    } catch {
      setAnalyzeMsg("⚠️ AI analysis failed. Fill fields manually.");
    } finally {
      setAnalyzeLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingVideo ? "Edit Resource" : "Add New Resource"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!editingVideo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Resource Analyzer
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Paste a URL and/or title, then Analyze. AI estimates from title only — always verify.</p>
              <div className="flex gap-2">
                <Input value={analyzeUrl} onChange={e => setAnalyzeUrl(e.target.value)}
                  placeholder="YouTube URL or resource link..." className="text-xs h-8" />
                <Button size="sm" onClick={analyzeResource}
                  disabled={analyzeLoading || (!analyzeUrl.trim() && !form.title.trim())}>
                  {analyzeLoading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
              {analyzeMsg && <p className="text-xs text-blue-700 dark:text-blue-300">{analyzeMsg}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Resource title..." />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Link / URL</Label>
              <Input value={form.link} onChange={e => update("link", e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Channel / Source</Label>
              <Input value={form.channel} onChange={e => update("channel", e.target.value)} placeholder="YouTube, Keepa, etc." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Source Type</Label>
              <Select value={form.sourceType ?? "YouTube Video"} onValueChange={v => update("sourceType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Difficulty</Label>
              <Select value={form.difficulty} onValueChange={v => update("difficulty", v as VideoDifficulty)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Day # (1-30, optional)</Label>
              <Input type="number" value={form.dayNumber ?? ""} onChange={e => update("dayNumber", e.target.value ? +e.target.value : undefined)} placeholder="e.g. 15" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Week #</Label>
              <Select value={form.weekNumber?.toString() ?? "none"} onValueChange={v => update("weekNumber", v === "none" ? undefined : +v)}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {[1, 2, 3, 4].map(w => <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Tags</Label>
            <div className="flex gap-2">
              <Select value="" onValueChange={v => { if (v && !form.tags.includes(v)) update("tags", [...form.tags, v]); }}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Pick tag..." /></SelectTrigger>
                <SelectContent>{ALL_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag()}
                placeholder="Custom..." className="flex-1 max-w-[140px]" />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {form.tags.map(t => (
                  <Badge key={t} variant="muted" className="cursor-pointer text-xs"
                    onClick={() => update("tags", form.tags.filter(x => x !== t))}>
                    {t} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs">Why Included</Label>
              <Textarea value={form.whyIncluded ?? ""} onChange={e => update("whyIncluded", e.target.value)} rows={2} placeholder="Why does this belong in the library?" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">What It Teaches</Label>
              <Textarea value={form.whatItTeaches ?? ""} onChange={e => update("whatItTeaches", e.target.value)} rows={2} placeholder="What skill or concept does this build?" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Practice Task</Label>
              <Textarea value={form.practiceTask ?? ""} onChange={e => update("practiceTask", e.target.value)} rows={2} placeholder="Specific task to do after watching..." />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input type="checkbox" checked={form.isBonus ?? false} onChange={e => update("isBonus", e.target.checked)} className="rounded" />
              Mark as Bonus Resource
            </label>
            {form.needsAIReview && <Badge variant="warning" className="text-xs">Needs Review</Badge>}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {editingVideo && (
            <Button variant="destructive" onClick={() => { onDelete(editingVideo.id); onClose(); }}>Delete</Button>
          )}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(form); onClose(); }} disabled={!form.title.trim()}>
            {editingVideo ? "Save Changes" : "Add Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── SmartStats Panel ─────────────────────────────────────────────────────────

function SmartStatsPanel({ videos }: { videos: Video[] }) {
  const weekStats = [1, 2, 3, 4].map(w => {
    const wv = videos.filter(v => v.weekNumber === w);
    const wd = wv.filter(v => v.status === "completed").length;
    return { week: w, total: wv.length, done: wd, info: WEEK_INFO[w] };
  });

  const catStats = CATEGORIES.map(cat => {
    const cv = videos.filter(v => v.category === cat);
    const cd = cv.filter(v => v.status === "completed").length;
    const confVideos = cv.filter(v => v.status === "completed" && (v.confidenceScore ?? 0) > 0);
    const avgConf = confVideos.length > 0 ? Math.round(confVideos.reduce((s, v) => s + (v.confidenceScore ?? 0), 0) / confVideos.length) : 0;
    return { cat, total: cv.length, done: cd, avgConf };
  }).filter(c => c.total > 0);

  const mostStudied = [...catStats].sort((a, b) => b.done - a.done)[0];
  const leastStudied = [...catStats].sort((a, b) => (a.done / Math.max(1, a.total)) - (b.done / Math.max(1, b.total)))[0];
  const practiceCount = videos.filter(v => v.practiceCompleted).length;
  const rewatchCount = videos.filter(v => v.needRewatch || v.status === "rewatch").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {weekStats.map(w => (
          <div key={w.week} className={cn("rounded-lg border p-3", w.info.bgClass)}>
            <p className={cn("text-xs font-semibold", w.info.colorClass)}>Week {w.week} · {w.info.title}</p>
            <p className="text-xl font-bold mt-0.5">{w.done}<span className="text-sm font-normal text-muted-foreground">/{w.total}</span></p>
            <Progress value={w.total > 0 ? (w.done / w.total) * 100 : 0} className="h-1.5 mt-1.5" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Most Studied</p>
          <p className="font-semibold text-sm mt-0.5 truncate">{mostStudied?.cat ?? "—"}</p>
          <p className="text-xs text-green-600">{mostStudied?.done ?? 0} completed</p>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <p className="text-xs text-muted-foreground">Needs Attention</p>
          <p className="font-semibold text-sm mt-0.5 truncate">{leastStudied?.cat ?? "—"}</p>
          <p className="text-xs text-orange-600">{leastStudied?.done ?? 0}/{leastStudied?.total ?? 0} done</p>
        </div>
        <div className="rounded-lg border bg-card p-3 flex gap-6">
          <div><p className="text-xs text-muted-foreground">Practice Done</p><p className="text-xl font-bold text-green-600">{practiceCount}</p></div>
          <div><p className="text-xs text-muted-foreground">Rewatch</p><p className="text-xl font-bold text-orange-600">{rewatchCount}</p></div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completion by Category</p>
        {catStats.map(c => (
          <div key={c.cat} className="flex items-center gap-2 text-xs">
            <span className="w-44 truncate text-muted-foreground shrink-0">{c.cat}</span>
            <Progress value={c.total > 0 ? (c.done / c.total) * 100 : 0} className="flex-1 h-1.5" />
            <span className="w-8 text-right shrink-0">{c.done}/{c.total}</span>
            {c.avgConf > 0 && <span className="text-blue-500 w-16 shrink-0">conf {c.avgConf}/10</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VideosPage() {
  const { videos, addVideo, updateVideo, deleteVideo } = useStore();
  const [activeTab, setActiveTab] = useState("plan");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterSourceType, setFilterSourceType] = useState("All");
  const [filterTag, setFilterTag] = useState("All");
  const [filterWeek, setFilterWeek] = useState("All");
  const [showStats, setShowStats] = useState(false);
  const [detailVideo, setDetailVideo] = useState<Video | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  const handleStatusChange = useCallback((id: string, status: VideoStatus) => {
    updateVideo(id, {
      status,
      ...(status === "completed" ? { dateWatched: new Date().toISOString() } : {}),
    });
  }, [updateVideo]);

  const handleViewDetails = useCallback((v: Video) => setDetailVideo(v), []);
  const handleEdit = useCallback((v: Video) => { setEditingVideo(v); setAddOpen(true); }, []);

  const tabFiltered = useMemo(() => videos.filter(v => {
    if (activeTab === "plan") return true;
    if (activeTab === "keepa") return v.category === "Keepa";
    if (activeTab === "selleramp") return v.category === "SellerAmp" || v.category === "Product Research";
    if (activeTab === "sourcing") return ["Sourcing", "Product Research"].includes(v.category ?? "");
    if (activeTab === "operations") return ["FBA Operations", "Inventory", "Ungating", "Risk Management", "Business"].includes(v.category ?? "");
    if (activeTab === "practice") return ["Practice", "Action", "Strategy", "Planning"].includes(v.category ?? "");
    if (activeTab === "rewatch") return v.needRewatch || v.status === "rewatch";
    if (activeTab === "completed") return v.status === "completed";
    return true;
  }), [videos, activeTab]);

  const filtered = useMemo(() => tabFiltered.filter(v => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) && !v.channel.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "All" && v.category !== filterCat) return false;
    if (filterStatus !== "All" && v.status !== filterStatus) return false;
    if (filterDiff !== "All" && v.difficulty !== filterDiff) return false;
    if (filterSourceType !== "All" && v.sourceType !== filterSourceType) return false;
    if (filterTag !== "All" && !(v.tags ?? []).includes(filterTag)) return false;
    if (filterWeek !== "All" && v.weekNumber?.toString() !== filterWeek) return false;
    return true;
  }), [tabFiltered, search, filterCat, filterStatus, filterDiff, filterSourceType, filterTag, filterWeek]);

  const stats = useMemo(() => {
    const total = videos.length;
    const completed = videos.filter(v => v.status === "completed").length;
    const watching = videos.filter(v => v.status === "watching").length;
    const rewatch = videos.filter(v => v.status === "rewatch" || v.needRewatch).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const currentDay = Math.min(
      (videos.filter(v => v.dayNumber && v.status === "completed").reduce((max, v) => Math.max(max, v.dayNumber ?? 0), 0) + 1),
      30
    );
    const catComp = CATEGORIES.map(cat => ({
      cat,
      ratio: (() => { const tv = videos.filter(v => v.category === cat); return tv.length > 0 ? tv.filter(v => v.status === "completed").length / tv.length : 0; })(),
    })).filter(c => c.ratio > 0 || videos.some(v => v.category === c.cat));
    const sorted = [...catComp].sort((a, b) => b.ratio - a.ratio);
    return { total, completed, watching, rewatch, pct, currentDay, strongest: sorted[0]?.cat ?? "—", weakest: sorted[sorted.length - 1]?.cat ?? "—" };
  }, [videos]);

  function handleSaveVideo(data: Omit<Video, "id" | "createdAt">) {
    if (editingVideo) updateVideo(editingVideo.id, data);
    else addVideo(data);
    setEditingVideo(null);
  }

  function handleSaveNotes(id: string, updates: Partial<Video>) {
    updateVideo(id, updates);
    setDetailVideo(prev => prev ? { ...prev, ...updates } : prev);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Curated Learning Library</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black">Video Library</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              Curated from the top FBA channels (Reezy Resells, Fields of Profit, Kev Blackburn). Tagged by importance — ★ Critical, Core, Supporting.
            </p>
            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> {stats.completed} done</span>
              <span className="flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5" /> {stats.watching} watching</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> {stats.pct}% complete</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowStats(s => !s)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-semibold hover:bg-white/25 transition"
            >
              <BarChart2 className="h-4 w-4" /> {showStats ? "Hide" : "Smart"} Stats
            </button>
            <button
              onClick={() => { setEditingVideo(null); setAddOpen(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-violet-700 text-sm font-semibold hover:scale-105 transition shadow-lg"
            >
              <Plus className="h-4 w-4" /> Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {([
          { label: "Total", value: stats.total, color: "text-foreground", icon: <BookOpen className="h-4 w-4 text-blue-500" /> },
          { label: "Completed", value: stats.completed, color: "text-green-600", icon: <CheckCircle2 className="h-4 w-4 text-green-500" /> },
          { label: "Watching", value: stats.watching, color: "text-blue-600", icon: <PlayCircle className="h-4 w-4 text-blue-500" /> },
          { label: "Rewatch", value: stats.rewatch, color: "text-orange-600", icon: <RotateCcw className="h-4 w-4 text-orange-500" /> },
          { label: "Progress", value: `${stats.pct}%`, color: "text-purple-600", icon: <TrendingUp className="h-4 w-4 text-purple-500" /> },
          { label: "Current Day", value: stats.currentDay, color: "text-blue-600", icon: <Calendar className="h-4 w-4 text-blue-500" /> },
          { label: "Strongest", value: stats.strongest, color: "text-green-600", icon: <Trophy className="h-4 w-4 text-yellow-500" /> },
          { label: "Weakest", value: stats.weakest, color: "text-red-500", icon: <AlertCircle className="h-4 w-4 text-red-400" /> },
        ] as const).map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">{s.icon}<p className="text-xs text-muted-foreground">{s.label}</p></div>
              <p className={cn("font-bold leading-tight truncate", s.color, typeof s.value === "string" && s.value.length > 5 ? "text-xs" : "text-lg")}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span>{stats.completed}/{stats.total} completed ({stats.pct}%)</span>
        </div>
        <Progress value={stats.pct} className="h-2" indicatorClassName={stats.pct >= 80 ? "bg-green-500" : stats.pct >= 50 ? "bg-blue-500" : undefined} />
      </div>

      {/* Smart Stats */}
      {showStats && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart2 className="h-4 w-4 text-purple-500" />Smart Stats</CardTitle>
          </CardHeader>
          <CardContent><SmartStatsPanel videos={videos} /></CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-0.5 flex-wrap border-b">
        {TAB_ITEMS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 text-sm rounded-t-md border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>
            {tab.label}
            {tab.id === "rewatch" && stats.rewatch > 0 && (
              <span className="ml-1.5 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">{stats.rewatch}</span>
            )}
            {tab.id === "completed" && stats.completed > 0 && (
              <span className="ml-1.5 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">{stats.completed}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      {activeTab !== "plan" && (
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-8" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent><SelectItem value="All">All Categories</SelectItem>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="All">All Status</SelectItem>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterDiff} onValueChange={setFilterDiff}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent><SelectItem value="All">All Levels</SelectItem><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
          </Select>
          <Select value={filterSourceType} onValueChange={setFilterSourceType}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Source Type" /></SelectTrigger>
            <SelectContent><SelectItem value="All">All Sources</SelectItem>{SOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent><SelectItem value="All">All Tags</SelectItem>{ALL_TAGS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filterWeek} onValueChange={setFilterWeek}>
            <SelectTrigger className="w-[100px]"><SelectValue placeholder="Week" /></SelectTrigger>
            <SelectContent><SelectItem value="All">All Weeks</SelectItem>{[1, 2, 3, 4].map(w => <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      {activeTab === "plan" ? (
        <ThirtyDayPlanView videos={videos} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} onEdit={handleEdit} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</p>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No resources match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(v => (
                <ResourceCard key={v.id} video={v} onStatusChange={handleStatusChange} onViewDetails={handleViewDetails} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <VideoDetailDialog video={detailVideo} onClose={() => setDetailVideo(null)} onSave={handleSaveNotes} />
      <AddEditDialog
        open={addOpen}
        editingVideo={editingVideo}
        onClose={() => { setAddOpen(false); setEditingVideo(null); }}
        onSave={handleSaveVideo}
        onDelete={deleteVideo}
      />
    </div>
  );
}
