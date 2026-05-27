"use client";
import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatDate, truncate } from "@/lib/utils";
import { Note } from "@/types";
import { Plus, Search, Star, AlertCircle, Bot, FileText } from "lucide-react";

const CATEGORIES = [
  "Keepa", "SellerAmp", "Product Research", "Competitor Research",
  "Supplier Research", "Inventory Management", "Risk Management",
  "Amazon FBA Basics", "Wholesale", "Strategy", "Mistakes", "General",
];

function ConfidenceStars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
        <div
          key={s}
          className={`w-3 h-3 rounded-full cursor-pointer border ${s <= value ? "bg-blue-500 border-blue-500" : "bg-transparent border-gray-300"}`}
          onClick={() => onChange?.(s)}
        />
      ))}
    </div>
  );
}

const EMPTY_FORM: Omit<Note, "id" | "createdAt"> = {
  title: "", category: "Keepa", subcategory: "", date: new Date().toISOString().split("T")[0],
  mainIdea: "", detailedNotes: "", keyLesson: "", mistakesToAvoid: "",
  actionSteps: "", relatedVideoId: "", relatedProductId: "",
  tags: [], confidenceScore: 5, needReview: false,
};

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterReview, setFilterReview] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Note, "id" | "createdAt">>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState("");
  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [rawNotes, setRawNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOrganized, setAiOrganized] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return notes.filter(n => {
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.mainIdea.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchCat = filterCat === "All" || n.category === filterCat;
      const matchReview = !filterReview || n.needReview;
      return matchSearch && matchCat && matchReview;
    });
  }, [notes, search, filterCat, filterReview]);

  function openAdd() {
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
    setEditingId(null);
    setTagInput("");
    setDialogOpen(true);
  }

  function openEdit(n: Note) {
    setForm({ title: n.title, category: n.category, subcategory: n.subcategory, date: n.date, mainIdea: n.mainIdea, detailedNotes: n.detailedNotes, keyLesson: n.keyLesson, mistakesToAvoid: n.mistakesToAvoid, actionSteps: n.actionSteps, relatedVideoId: n.relatedVideoId, relatedProductId: n.relatedProductId, tags: n.tags, confidenceScore: n.confidenceScore, needReview: n.needReview });
    setEditingId(n.id);
    setTagInput("");
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
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput("");
    }
  }

  async function organizeWithAI() {
    if (!rawNotes.trim()) return;
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "organize_notes",
          data: { notes: rawNotes },
        }),
      });
      const data = await response.json();
      setAiOrganized(data.result || "Could not organize notes. Please check your AI Coach API settings.");
    } catch {
      setAiOrganized("Error calling AI service. Make sure ANTHROPIC_API_KEY is set.");
    } finally {
      setAiLoading(false);
    }
  }

  function useOrganized() {
    if (!aiOrganized) return;
    setForm(f => ({ ...f, detailedNotes: aiOrganized }));
    setAiDialogOpen(false);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Notes</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black">Capture the lesson while it&apos;s fresh.</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              {notes.length} notes · {notes.filter(n => n.needReview).length} need review · The ones you don&apos;t write down, you forget.
            </p>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search notes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch checked={filterReview} onCheckedChange={setFilterReview} id="review-filter" />
            <Label htmlFor="review-filter" className="text-sm cursor-pointer">Need Review</Label>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(n => (
          <Card key={n.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewNote(n)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">{n.title}</h3>
                {n.needReview && <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />}
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="info" className="text-xs">{n.category}</Badge>
                {n.subcategory && <Badge variant="muted" className="text-xs">{n.subcategory}</Badge>}
              </div>
              {n.mainIdea && <p className="text-xs text-muted-foreground line-clamp-2">{n.mainIdea}</p>}
              {n.keyLesson && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-2">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">Key Lesson:</p>
                  <p className="text-xs text-green-600 dark:text-green-500 line-clamp-2">{n.keyLesson}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{formatDate(n.date)}</span>
                <ConfidenceStars value={n.confidenceScore} />
              </div>
              {n.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {n.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  {n.tags.length > 3 && <span className="text-xs text-muted-foreground">+{n.tags.length - 3}</span>}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notes yet. Start taking notes from your videos and practice sessions!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Note" : "New Note"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Subcategory</Label>
                <Input value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} placeholder="Optional subcategory" />
              </div>
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="space-y-1 flex items-end gap-2">
                <div className="flex-1">
                  <Label>Confidence (1-10): {form.confidenceScore}</Label>
                  <input type="range" min={1} max={10} value={form.confidenceScore} onChange={e => setForm(f => ({ ...f, confidenceScore: +e.target.value }))} className="w-full" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Switch checked={form.needReview} onCheckedChange={v => setForm(f => ({ ...f, needReview: v }))} id="need-review" />
                  <Label htmlFor="need-review" className="text-xs">Need Review</Label>
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Main Idea</Label>
                <Input value={form.mainIdea} onChange={e => setForm(f => ({ ...f, mainIdea: e.target.value }))} placeholder="One sentence summary" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Detailed Notes</Label>
                <Textarea value={form.detailedNotes} onChange={e => setForm(f => ({ ...f, detailedNotes: e.target.value }))} placeholder="Full notes, observations, examples..." rows={4} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Key Lesson</Label>
                <Input value={form.keyLesson} onChange={e => setForm(f => ({ ...f, keyLesson: e.target.value }))} placeholder="The most important thing to remember" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Mistakes to Avoid</Label>
                <Textarea value={form.mistakesToAvoid} onChange={e => setForm(f => ({ ...f, mistakesToAvoid: e.target.value }))} placeholder="Common mistakes related to this topic..." rows={2} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Action Steps</Label>
                <Textarea value={form.actionSteps} onChange={e => setForm(f => ({ ...f, actionSteps: e.target.value }))} placeholder="What will you practice or do next?" rows={2} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag and press Enter..." onKeyDown={e => e.key === "Enter" && addTag()} />
                  <Button type="button" variant="outline" onClick={addTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.tags.map(t => (
                    <Badge key={t} variant="secondary" className="cursor-pointer text-xs" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}>{t} ×</Badge>
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

      {/* View Dialog */}
      {viewNote && (
        <Dialog open={!!viewNote} onOpenChange={() => setViewNote(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewNote.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">{viewNote.category}</Badge>
                {viewNote.subcategory && <Badge variant="muted">{viewNote.subcategory}</Badge>}
                {viewNote.needReview && <Badge variant="warning">Needs Review</Badge>}
              </div>
              {viewNote.mainIdea && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Main Idea</p><p>{viewNote.mainIdea}</p></div>}
              {viewNote.detailedNotes && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Detailed Notes</p><p className="whitespace-pre-wrap">{viewNote.detailedNotes}</p></div>}
              {viewNote.keyLesson && <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md"><p className="font-semibold text-xs text-green-700 dark:text-green-400 uppercase mb-1">Key Lesson</p><p className="text-green-700 dark:text-green-400">{viewNote.keyLesson}</p></div>}
              {viewNote.mistakesToAvoid && <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md"><p className="font-semibold text-xs text-red-700 dark:text-red-400 uppercase mb-1">Mistakes to Avoid</p><p className="text-red-700 dark:text-red-400">{viewNote.mistakesToAvoid}</p></div>}
              {viewNote.actionSteps && <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md"><p className="font-semibold text-xs text-blue-700 dark:text-blue-400 uppercase mb-1">Action Steps</p><p className="text-blue-700 dark:text-blue-400">{viewNote.actionSteps}</p></div>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { openEdit(viewNote); setViewNote(null); }}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => updateNote(viewNote.id, { needReview: !viewNote.needReview })}>
                  {viewNote.needReview ? "Mark Reviewed" : "Flag for Review"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Organize Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-blue-500" /> Organize Notes with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Paste your messy notes here:</Label>
              <Textarea value={rawNotes} onChange={e => setRawNotes(e.target.value)} placeholder="Paste any raw notes, bullet points, or messy text here. The AI will organize them into structured FBA learning notes." rows={6} />
            </div>
            {aiOrganized && (
              <div className="space-y-1">
                <Label className="text-green-600">Organized Notes:</Label>
                <div className="bg-muted rounded-md p-3 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">{aiOrganized}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Close</Button>
            {aiOrganized && <Button variant="outline" onClick={useOrganized}>Use in New Note</Button>}
            <Button onClick={organizeWithAI} disabled={aiLoading || !rawNotes.trim()}>
              {aiLoading ? "Organizing..." : "Organize with AI"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
