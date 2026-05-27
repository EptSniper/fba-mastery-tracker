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
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { Flashcard, VideoDifficulty } from "@/types";
import { Plus, Brain, CheckCircle2, XCircle, Eye, RotateCcw } from "lucide-react";

const CATEGORIES = [
  "All", "Keepa", "SellerAmp", "Product Research", "Risk Management",
  "Inventory Management", "Competitor Research", "Amazon FBA Basics",
];

const DIFFICULTY_COLORS: Record<VideoDifficulty, string> = {
  beginner: "text-green-600 bg-green-50 border-green-200",
  intermediate: "text-yellow-700 bg-yellow-50 border-yellow-200",
  advanced: "text-red-600 bg-red-50 border-red-200",
};

const EMPTY_FORM = (): Omit<Flashcard, "id" | "createdAt"> => ({
  question: "", answer: "", category: "Keepa", difficulty: "beginner",
  status: "new", lastReviewed: "", confidenceScore: 0,
});

function FlashcardStudy({ cards, onClose }: { cards: Flashcard[]; onClose: () => void }) {
  const { updateFlashcard } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0, reviewed: 0 });

  const card = cards[currentIdx];
  if (!card) return (
    <div className="text-center py-8 space-y-4">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
      <h3 className="text-xl font-bold">Session Complete!</h3>
      <div className="flex gap-6 justify-center text-sm">
        <span className="text-green-600 font-medium">{sessionStats.known} Known</span>
        <span className="text-red-600 font-medium">{sessionStats.unknown} Review</span>
        <span className="text-muted-foreground">{sessionStats.reviewed} Reviewed</span>
      </div>
      <Button onClick={onClose}>Done</Button>
    </div>
  );

  function markKnown() {
    updateFlashcard(card.id, { status: "known", lastReviewed: new Date().toISOString(), confidenceScore: Math.min(10, (card.confidenceScore || 0) + 1) });
    setSessionStats(s => ({ ...s, known: s.known + 1, reviewed: s.reviewed + 1 }));
    setCurrentIdx(i => i + 1);
    setFlipped(false);
  }

  function markUnknown() {
    updateFlashcard(card.id, { status: "learning", lastReviewed: new Date().toISOString(), confidenceScore: Math.max(0, (card.confidenceScore || 0) - 1) });
    setSessionStats(s => ({ ...s, unknown: s.unknown + 1, reviewed: s.reviewed + 1 }));
    setCurrentIdx(i => i + 1);
    setFlipped(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{currentIdx + 1} of {cards.length}</span>
        <Progress value={(currentIdx / cards.length) * 100} className="flex-1 mx-4 h-2" />
        <Button size="sm" variant="ghost" onClick={onClose}>Exit</Button>
      </div>

      <div className="min-h-[300px] flex flex-col items-center justify-center cursor-pointer" onClick={() => setFlipped(!flipped)}>
        <div className={`w-full max-w-xl p-8 rounded-xl border-2 transition-all ${flipped ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300" : "bg-card border-border"}`}>
          <div className="text-center space-y-4">
            <Badge variant={card.difficulty === "beginner" ? "success" : card.difficulty === "intermediate" ? "warning" : "destructive"} className="text-xs">{card.difficulty} · {card.category}</Badge>
            {!flipped ? (
              <div>
                <p className="text-xs text-muted-foreground mb-3">Question (tap to reveal answer)</p>
                <p className="text-lg font-semibold">{card.question}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-blue-600 mb-3">Answer</p>
                <p className="text-base leading-relaxed">{card.answer}</p>
              </div>
            )}
            {!flipped && <p className="text-xs text-muted-foreground mt-4">Click to flip</p>}
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-4 justify-center">
          <Button variant="outline" className="flex-1 max-w-[150px] border-red-300 text-red-600 hover:bg-red-50" onClick={markUnknown}>
            <XCircle className="h-4 w-4" /> Still Learning
          </Button>
          <Button className="flex-1 max-w-[150px] bg-green-600 hover:bg-green-700" onClick={markKnown}>
            <CheckCircle2 className="h-4 w-4" /> I Know This
          </Button>
        </div>
      )}
    </div>
  );
}

export default function QuizzesPage() {
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard } = useStore();
  const [filterCat, setFilterCat] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [studyMode, setStudyMode] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Flashcard, "id" | "createdAt">>(EMPTY_FORM());
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => flashcards.filter(f => {
    const matchCat = filterCat === "All" || f.category === filterCat;
    const matchDiff = filterDiff === "All" || f.difficulty === filterDiff;
    const matchStatus = filterStatus === "All" || f.status === filterStatus;
    return matchCat && matchDiff && matchStatus;
  }), [flashcards, filterCat, filterDiff, filterStatus]);

  const stats = useMemo(() => ({
    total: flashcards.length,
    known: flashcards.filter(f => f.status === "known").length,
    learning: flashcards.filter(f => f.status === "learning").length,
    new: flashcards.filter(f => f.status === "new").length,
  }), [flashcards]);

  function startStudy() {
    const toStudy = filtered.filter(f => f.status !== "known");
    if (toStudy.length === 0) { alert("No cards to study! All cards in this filter are marked as known."); return; }
    setStudyCards([...toStudy].sort(() => Math.random() - 0.5));
    setStudyMode(true);
  }

  function openAdd() { setForm(EMPTY_FORM()); setEditingId(null); setDialogOpen(true); }
  function openEdit(f: Flashcard) { const { id, createdAt, ...rest } = f; setForm(rest); setEditingId(f.id); setDialogOpen(true); }
  function handleSave() { if (!form.question || !form.answer) return; if (editingId) updateFlashcard(editingId, form); else addFlashcard(form); setDialogOpen(false); }

  if (studyMode) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Flashcard Study Session</h1>
        <FlashcardStudy cards={studyCards} onClose={() => setStudyMode(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quizzes & Flashcards</h1>
          <p className="text-muted-foreground text-sm">{stats.total} cards · {stats.known} known · {stats.learning} learning · {stats.new} new</p>
        </div>
        <div className="flex gap-2">
          <Button variant="success" onClick={startStudy}>
            <Brain className="h-4 w-4" />
            Study ({filtered.filter(f => f.status !== "known").length} cards)
          </Button>
          <Button onClick={openAdd}><Plus className="h-4 w-4" />Add Card</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.known}</p><p className="text-xs text-muted-foreground">Known</p><Progress value={stats.total > 0 ? (stats.known / stats.total) * 100 : 0} className="h-1 mt-2" indicatorClassName="bg-green-500" /></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{stats.learning}</p><p className="text-xs text-muted-foreground">Learning</p><Progress value={stats.total > 0 ? (stats.learning / stats.total) * 100 : 0} className="h-1 mt-2" /></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-gray-500">{stats.new}</p><p className="text-xs text-muted-foreground">New</p><Progress value={stats.total > 0 ? (stats.new / stats.total) * 100 : 0} className="h-1 mt-2" indicatorClassName="bg-gray-400" /></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={filterDiff} onValueChange={setFilterDiff}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="known">Known</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(f => {
          const isFlipped = flippedCards.has(f.id);
          return (
            <Card key={f.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge className={`text-xs ${DIFFICULTY_COLORS[f.difficulty]}`}>{f.difficulty}</Badge>
                  <Badge variant="muted" className="text-xs">{f.category}</Badge>
                  <Badge variant={f.status === "known" ? "success" : f.status === "learning" ? "info" : "muted"} className="text-xs ml-auto">{f.status}</Badge>
                </div>
                <p className="text-sm font-medium">{f.question}</p>
                {isFlipped && <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md"><p className="text-sm">{f.answer}</p></div>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setFlippedCards(prev => { const next = new Set(prev); if (next.has(f.id)) next.delete(f.id); else next.add(f.id); return next; })}>
                    <Eye className="h-3 w-3" /> {isFlipped ? "Hide" : "Show Answer"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEdit(f)}>Edit</Button>
                  {f.status !== "known" && (
                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 ml-auto" onClick={() => updateFlashcard(f.id, { status: "known", lastReviewed: new Date().toISOString() })}>
                      <CheckCircle2 className="h-3 w-3" /> Mark Known
                    </Button>
                  )}
                </div>
                {f.confidenceScore > 0 && (
                  <div className="flex gap-0.5">
                    {[...Array(10)].map((_, i) => <div key={i} className={`flex-1 h-1 rounded-sm ${i < f.confidenceScore ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />)}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No flashcards match your filters.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Flashcard" : "New Flashcard"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Question *</Label><Textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>Answer *</Label><Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v as VideoDifficulty }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {editingId && <Button variant="destructive" onClick={() => { deleteFlashcard(editingId); setDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSave}>Save Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
