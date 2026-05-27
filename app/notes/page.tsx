"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatDate, cn } from "@/lib/utils";
import { Note, Video } from "@/types";
import {
  Plus, Search, AlertCircle, Bot, FileText, PlayCircle,
  ChevronDown, ChevronUp, BookOpen, Trash2, ExternalLink, Sparkles, Star,
} from "lucide-react";

const CATEGORIES = [
  "Keepa", "SellerAmp", "Product Research", "Competitor Research",
  "Supplier Research", "Inventory Management", "Risk Management",
  "Amazon FBA Basics", "Wholesale", "Strategy", "Mistakes", "General",
];

const WEEK_INFO: Record<number, { title: string; hue: string }> = {
  1: { title: "Foundations", hue: "from-pink-500 to-rose-500" },
  2: { title: "Master Keepa", hue: "from-violet-500 to-fuchsia-500" },
  3: { title: "SellerAmp & Sourcing", hue: "from-indigo-500 to-cyan-500" },
  4: { title: "Health, Ops & Scale", hue: "from-amber-500 to-orange-500" },
};

type GroupBy = "week" | "category" | "recent";

const EMPTY_FORM: Omit<Note, "id" | "createdAt"> = {
  title: "", category: "Keepa", subcategory: "", date: new Date().toISOString().split("T")[0],
  mainIdea: "", detailedNotes: "", keyLesson: "", mistakesToAvoid: "",
  actionSteps: "", relatedVideoId: "", relatedProductId: "",
  tags: [], confidenceScore: 5, needReview: false,
};

export default function NotesPage() {
  const { notes, videos, addNote, updateNote, deleteNote } = useStore();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterReview, setFilterReview] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("week");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Note, "id" | "createdAt">>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOrganized, setAiOrganized] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Map noteId → video for fast lookup
  const videoById = useMemo(() => {
    const map = new Map<string, Video>();
    videos.forEach((v) => map.set(v.id, v));
    return map;
  }, [videos]);

  // Apply search/filter
  const filtered = useMemo(() => {
    return notes.filter((n) => {
      const haystack = `${n.title} ${n.mainIdea} ${n.detailedNotes} ${n.tags.join(" ")}`.toLowerCase();
      const matchSearch = !search || haystack.includes(search.toLowerCase());
      const matchCat = filterCat === "All" || n.category === filterCat;
      const matchReview = !filterReview || n.needReview;
      return matchSearch && matchCat && matchReview;
    });
  }, [notes, search, filterCat, filterReview]);

  // Group notes for display
  type Group = { key: string; label: string; sub?: string; hue?: string; notes: Note[] };
  const groups: Group[] = useMemo(() => {
    if (groupBy === "recent") {
      return [{
        key: "all",
        label: "All notes",
        sub: `Sorted newest first`,
        notes: [...filtered].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      }];
    }

    if (groupBy === "category") {
      const map = new Map<string, Note[]>();
      filtered.forEach((n) => {
        const k = n.category || "General";
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(n);
      });
      return [...map.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([cat, arr]) => ({ key: cat, label: cat, notes: arr }));
    }

    // groupBy === "week"
    const weekBuckets: Record<string, Note[]> = {
      "w1": [], "w2": [], "w3": [], "w4": [], "bonus": [], "free": [],
    };
    filtered.forEach((n) => {
      const video = n.relatedVideoId ? videoById.get(n.relatedVideoId) : undefined;
      if (!video) { weekBuckets.free.push(n); return; }
      if (video.isBonus) { weekBuckets.bonus.push(n); return; }
      const w = video.weekNumber;
      if (w === 1) weekBuckets.w1.push(n);
      else if (w === 2) weekBuckets.w2.push(n);
      else if (w === 3) weekBuckets.w3.push(n);
      else if (w === 4) weekBuckets.w4.push(n);
      else weekBuckets.free.push(n);
    });

    const out: Group[] = [];
    for (let w = 1; w <= 4; w++) {
      const arr = weekBuckets[`w${w}`];
      if (arr.length === 0) continue;
      out.push({
        key: `w${w}`,
        label: `Week ${w} — ${WEEK_INFO[w].title}`,
        sub: `${arr.length} note${arr.length === 1 ? "" : "s"}`,
        hue: WEEK_INFO[w].hue,
        notes: arr.sort((a, b) => {
          const va = a.relatedVideoId ? videoById.get(a.relatedVideoId)?.dayNumber ?? 99 : 99;
          const vb = b.relatedVideoId ? videoById.get(b.relatedVideoId)?.dayNumber ?? 99 : 99;
          return va - vb;
        }),
      });
    }
    if (weekBuckets.bonus.length) {
      out.push({
        key: "bonus", label: "Bonus", sub: `${weekBuckets.bonus.length} note${weekBuckets.bonus.length === 1 ? "" : "s"}`,
        hue: "from-rose-500 to-pink-500", notes: weekBuckets.bonus,
      });
    }
    if (weekBuckets.free.length) {
      out.push({
        key: "free", label: "Free-form Notes", sub: `${weekBuckets.free.length} note${weekBuckets.free.length === 1 ? "" : "s"} — not tied to a video`,
        hue: "from-slate-500 to-zinc-500", notes: weekBuckets.free,
      });
    }
    return out;
  }, [filtered, groupBy, videoById]);

  function toggleGroup(key: string) {
    setCollapsed((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
    setEditingId(null);
    setTagInput("");
    setDialogOpen(true);
  }

  function openEdit(n: Note) {
    setForm({
      title: n.title, category: n.category, subcategory: n.subcategory, date: n.date,
      mainIdea: n.mainIdea, detailedNotes: n.detailedNotes, keyLesson: n.keyLesson,
      mistakesToAvoid: n.mistakesToAvoid, actionSteps: n.actionSteps,
      relatedVideoId: n.relatedVideoId, relatedProductId: n.relatedProductId,
      tags: n.tags, confidenceScore: n.confidenceScore, needReview: n.needReview,
    });
    setEditingId(n.id);
    setTagInput("");
    setViewNote(null);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.title) return;
    if (editingId) updateNote(editingId, form);
    else addNote(form);
    setDialogOpen(false);
  }

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  async function organizeWithAI() {
    if (!rawNotes.trim()) return;
    setAiLoading(true);
    try {
      const r = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "organize_notes", data: { notes: rawNotes } }),
      });
      const data = await r.json();
      setAiOrganized(data.result || "Could not organize notes.");
    } catch {
      setAiOrganized("Error calling AI service.");
    } finally {
      setAiLoading(false);
    }
  }

  function useOrganized() {
    if (!aiOrganized) return;
    setForm((f) => ({ ...f, detailedNotes: aiOrganized }));
    setAiDialogOpen(false);
    setDialogOpen(true);
  }

  const totalNotes = notes.length;
  const reviewCount = notes.filter((n) => n.needReview).length;
  const linkedCount = notes.filter((n) => n.relatedVideoId).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Notes</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black">Everything you&apos;ve learned, in one place.</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              Video notes save here automatically. Add free-form notes too.
            </p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> {totalNotes} total</span>
              <span className="flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5" /> {linkedCount} from videos</span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5" /> {reviewCount} need review</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setAiOrganized(null); setRawNotes(""); setAiDialogOpen(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-semibold hover:bg-white/25 transition"
            >
              <Bot className="h-4 w-4" /> Organize with AI
            </button>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-orange-700 text-sm font-semibold hover:scale-105 transition shadow-lg"
            >
              <Plus className="h-4 w-4" /> Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card-soft p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-2">
          <Switch checked={filterReview} onCheckedChange={setFilterReview} id="review-filter" />
          <Label htmlFor="review-filter" className="text-sm cursor-pointer">Need review</Label>
        </div>

        {/* Group-by tabs */}
        <div className="flex items-center bg-muted rounded-lg p-0.5 ml-auto">
          {([
            ["week", "By Week"],
            ["category", "By Category"],
            ["recent", "Recent"],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setGroupBy(k)}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-md transition",
                groupBy === k ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card-soft p-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">
            {notes.length === 0 ? "No notes yet" : "No notes match those filters"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5">
            {notes.length === 0
              ? "Watch a video and type in the notes panel — it'll show up here automatically."
              : "Try clearing your search or changing the filters."}
          </p>
          {notes.length === 0 && (
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:opacity-90 transition"
            >
              <PlayCircle className="h-4 w-4" /> Open Video Library
            </Link>
          )}
        </div>
      )}

      {/* Groups */}
      {groups.map((g) => (
        <section key={g.key} className="card-soft overflow-hidden">
          <button
            onClick={() => toggleGroup(g.key)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition text-left"
          >
            <div className={cn(
              "w-1.5 self-stretch rounded-full bg-gradient-to-b",
              g.hue ?? "from-violet-500 to-fuchsia-500",
            )} />
            <div className="flex-1">
              <h2 className="font-bold">{g.label}</h2>
              {g.sub && <p className="text-xs text-muted-foreground">{g.sub}</p>}
            </div>
            {collapsed.has(g.key) ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
          </button>

          {!collapsed.has(g.key) && (
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.notes.map((n) => {
                const video = n.relatedVideoId ? videoById.get(n.relatedVideoId) : null;
                const preview = (n.detailedNotes || n.mainIdea || n.keyLesson || "").trim();
                return (
                  <div
                    key={n.id}
                    onClick={() => setViewNote(n)}
                    className="group relative rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-violet-400 hover:shadow-md transition flex flex-col gap-2"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {video?.dayNumber && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white">
                            D{video.dayNumber}
                          </span>
                        )}
                        {video?.weekNumber && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            W{video.weekNumber}
                          </span>
                        )}
                        {!video && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">FREE</span>
                        )}
                      </div>
                      {n.needReview && <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2">{n.title || "Untitled"}</h3>

                    {/* Preview */}
                    {preview && (
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {preview}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto pt-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="muted" className="text-[10px] h-4 px-1.5">{n.category}</Badge>
                        <span>{formatDate(n.date || n.createdAt)}</span>
                      </div>
                      {video && (
                        <Link
                          href={`/watch/${video.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 hover:text-violet-600 dark:hover:text-violet-300 transition"
                          title="Watch video"
                        >
                          <PlayCircle className="h-3 w-3" /> watch
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {/* ─── Add/Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Note title" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Main idea (one sentence)</Label>
                <Input value={form.mainIdea} onChange={(e) => setForm((f) => ({ ...f, mainIdea: e.target.value }))} placeholder="The one-sentence summary." />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notes</Label>
                <Textarea value={form.detailedNotes} onChange={(e) => setForm((f) => ({ ...f, detailedNotes: e.target.value }))} placeholder="Full notes, examples, anything…" rows={8} />
              </div>
              <div className="space-y-1">
                <Label>Confidence (1–10): {form.confidenceScore}</Label>
                <input type="range" min={1} max={10} value={form.confidenceScore} onChange={(e) => setForm((f) => ({ ...f, confidenceScore: +e.target.value }))} className="w-full" />
              </div>
              <div className="space-y-1 flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Switch checked={form.needReview} onCheckedChange={(v) => setForm((f) => ({ ...f, needReview: v }))} id="need-review" />
                  <Label htmlFor="need-review" className="text-xs">Need Review</Label>
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag and press Enter…" onKeyDown={(e) => e.key === "Enter" && addTag()} />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="cursor-pointer text-xs" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}>{t} ×</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {editingId && <Button variant="destructive" onClick={() => { deleteNote(editingId); setDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSave}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── View Note Dialog ─── */}
      {viewNote && (
        <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                {viewNote.title || "Untitled"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <Badge variant="info">{viewNote.category}</Badge>
                {viewNote.subcategory && <Badge variant="muted">{viewNote.subcategory}</Badge>}
                <span>{formatDate(viewNote.date || viewNote.createdAt)}</span>
                {viewNote.needReview && <Badge variant="warning">Needs review</Badge>}
              </div>

              {viewNote.relatedVideoId && videoById.get(viewNote.relatedVideoId) && (
                <Link
                  href={`/watch/${viewNote.relatedVideoId}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition"
                >
                  <PlayCircle className="h-4 w-4 text-violet-600 shrink-0" />
                  <span className="flex-1 truncate">{videoById.get(viewNote.relatedVideoId)?.title}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </Link>
              )}

              {viewNote.mainIdea && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 mb-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Main idea
                  </div>
                  <p>{viewNote.mainIdea}</p>
                </div>
              )}

              {viewNote.detailedNotes && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Notes
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{viewNote.detailedNotes}</p>
                </div>
              )}

              {viewNote.keyLesson && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 mb-1">Key lesson</div>
                  <p>{viewNote.keyLesson}</p>
                </div>
              )}

              {viewNote.mistakesToAvoid && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                  <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 mb-1">Mistakes to avoid</div>
                  <p className="whitespace-pre-wrap">{viewNote.mistakesToAvoid}</p>
                </div>
              )}

              {viewNote.actionSteps && (
                <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                  <div className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 mb-1">Action steps</div>
                  <p className="whitespace-pre-wrap">{viewNote.actionSteps}</p>
                </div>
              )}

              {viewNote.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {viewNote.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <div
                      key={s}
                      className={cn(
                        "w-3 h-3 rounded-full border",
                        s <= viewNote.confidenceScore
                          ? "bg-violet-500 border-violet-500"
                          : "bg-transparent border-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  Confidence: {viewNote.confidenceScore}/10
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={() => { deleteNote(viewNote.id); setViewNote(null); }}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
              <Button variant="outline" onClick={() => setViewNote(null)}>Close</Button>
              <Button onClick={() => openEdit(viewNote)}>Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ─── AI Organize Dialog ─── */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-fuchsia-500" /> Organize Notes with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Paste raw, messy notes — the AI Coach will structure them into Main Idea, Key Points, How To Apply, Mistakes to Avoid, and Action Steps.
            </p>
            <Textarea
              value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste your raw notes here…"
              rows={8}
            />
            {aiOrganized && (
              <div className="p-3 rounded-lg border bg-muted/40 max-h-60 overflow-y-auto whitespace-pre-wrap text-sm">
                {aiOrganized}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
            {!aiOrganized ? (
              <Button onClick={organizeWithAI} disabled={aiLoading || !rawNotes.trim()}>
                {aiLoading ? "Organizing…" : "Organize"}
              </Button>
            ) : (
              <Button onClick={useOrganized}>Use organized version</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
