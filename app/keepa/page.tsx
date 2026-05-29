"use client";
import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatCurrency } from "@/lib/utils";
import { scoreKeepaMarket, BSR_CATEGORY_NAMES } from "@/lib/scoring";
import { KeepaEntry, KeepaDecision } from "@/types";
import { Plus, Search, CheckCircle2, XCircle, Target, AlertTriangle, LineChart, Gauge } from "lucide-react";

const KEEPA_DECISIONS: KeepaDecision[] = [
  "good_buy", "bad_buy", "manual_review", "too_risky", "oversaturated",
  "amazon_dominated", "price_unstable", "seasonal", "not_enough_demand", "need_more_data",
];

const DECISION_LABELS: Record<KeepaDecision, string> = {
  good_buy: "Good Buy",
  bad_buy: "Bad Buy",
  manual_review: "Manual Review",
  too_risky: "Too Risky",
  oversaturated: "Oversaturated",
  amazon_dominated: "Amazon Dominated",
  price_unstable: "Price Unstable",
  seasonal: "Seasonal",
  not_enough_demand: "Not Enough Demand",
  need_more_data: "Need More Data",
};

const DECISION_COLORS: Record<KeepaDecision, string> = {
  good_buy: "text-green-600 bg-green-50 border-green-200",
  bad_buy: "text-red-600 bg-red-50 border-red-200",
  manual_review: "text-yellow-700 bg-yellow-50 border-yellow-200",
  too_risky: "text-red-600 bg-red-50 border-red-200",
  oversaturated: "text-orange-600 bg-orange-50 border-orange-200",
  amazon_dominated: "text-red-700 bg-red-50 border-red-200",
  price_unstable: "text-orange-600 bg-orange-50 border-orange-200",
  seasonal: "text-purple-600 bg-purple-50 border-purple-200",
  not_enough_demand: "text-gray-600 bg-gray-50 border-gray-200",
  need_more_data: "text-blue-600 bg-blue-50 border-blue-200",
};

// Research-backed checklist, grouped by the SellerAmp "O.A. Risk Matrix" pillars.
const CHECKLIST_ITEMS: { key: string; label: string; pillar: string }[] = [
  { key: "bsrTopTier", label: "BSR is in the top ~1–5% for its category (fast mover)", pillar: "Velocity" },
  { key: "consistentRankDrops", label: "Sales rank drops consistently (each drop ≈ a sale)", pillar: "Velocity" },
  { key: "salesPerSellerOk", label: "Expected sales/seller ≥ 3–5 per month", pillar: "Velocity" },
  { key: "acceptableFBASellers", label: "3–15 FBA sellers (not oversaturated, not a 1-seller brand)", pillar: "Competition" },
  { key: "offerCountStable", label: "Offer count is stable or declining (not exploding)", pillar: "Competition" },
  { key: "amazonNotInStock", label: "Amazon absent or rarely in the buy box (< ~20%)", pillar: "Amazon" },
  { key: "priceAtOrAboveAvg", label: "Current price is at/above the 90-day average", pillar: "Buy Box" },
  { key: "notTanking", label: "30-day average is NOT crashing below the 90-day", pillar: "Buy Box" },
  { key: "noIpRisk", label: "No IP-complaint risk — brand is safe to sell new", pillar: "IP / Listing" },
  { key: "notRestricted", label: "Not hazmat / meltable / gated / restricted for me", pillar: "IP / Listing" },
  { key: "profitReal", label: "ROI ≥ 30% and ≥ $3–5 profit after ALL fees", pillar: "Profit" },
  { key: "wouldTestBuy", label: "Would buy 5–20 test units at this price", pillar: "Action" },
];

const COMMON_MISTAKES = [
  "I trusted current price too much",
  "I ignored the 90-day average",
  "I ignored seller count",
  "I missed Amazon being in stock",
  "I ignored seasonality",
  "I ignored weak rank drops",
  "I missed price tanking",
  "I did not check pack count",
  "I did not check restrictions",
  "I did not check IP risk",
  "I overestimated sales",
  "I ignored FBA seller count",
];

const EMPTY_FORM = (): Omit<KeepaEntry, "id" | "createdAt"> => ({
  productName: "", asin: "", amazonLink: "", category: "", screenshotUrl: "",
  currentBuyBox: 0, avg30DayPrice: 0, avg90DayPrice: 0, avg180DayPrice: 0,
  salesRank: 0, salesRankDrops: 0, offerCount: 0, fbaSellerCount: 0,
  amazonInStockPercent: 0, reviewCount: 0, rating: 0,
  myAnalysis: "", myDecision: "manual_review", correctDecision: "manual_review",
  whatIMissed: "", lessonLearned: "", confidenceScore: 5,
  checklist: Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, false])),
  mistakes: [],
});

export default function KeepaPage() {
  const { keepaEntries, addKeepaEntry, updateKeepaEntry, deleteKeepaEntry } = useStore();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<KeepaEntry, "id" | "createdAt">>(EMPTY_FORM());
  const [viewEntry, setViewEntry] = useState<KeepaEntry | null>(null);

  const filtered = useMemo(() => keepaEntries.filter(k =>
    !search || k.productName.toLowerCase().includes(search.toLowerCase()) || k.asin.toLowerCase().includes(search.toLowerCase())
  ), [keepaEntries, search]);

  const stats = useMemo(() => {
    const correct = keepaEntries.filter(k => k.myDecision === k.correctDecision).length;
    const total = keepaEntries.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const mistakes = keepaEntries.flatMap(k => k.mistakes).reduce((acc, m) => {
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topMistake = Object.entries(mistakes).sort(([, a], [, b]) => b - a)[0];
    return { correct, total, accuracy, topMistake: topMistake?.[0] || "None yet" };
  }, [keepaEntries]);

  function openAdd() {
    setForm(EMPTY_FORM());
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(k: KeepaEntry) {
    const { id, createdAt, ...rest } = k;
    setForm(rest);
    setEditingId(k.id);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.productName) return;
    if (editingId) updateKeepaEntry(editingId, form);
    else addKeepaEntry(form);
    setDialogOpen(false);
  }

  function toggleChecklistItem(key: string) {
    setForm(f => ({ ...f, checklist: { ...f.checklist, [key]: !f.checklist[key] } }));
  }

  function toggleMistake(m: string) {
    setForm(f => ({
      ...f,
      mistakes: f.mistakes.includes(m) ? f.mistakes.filter(x => x !== m) : [...f.mistakes, m],
    }));
  }

  const checklistScore = Object.values(form.checklist).filter(Boolean).length;
  const checklistTotal = CHECKLIST_ITEMS.length;

  // Live "what the rules say" verdict from the entered Keepa numbers.
  const market = useMemo(() => scoreKeepaMarket({
    category: form.category,
    salesRank: form.salesRank,
    salesRankDrops: form.salesRankDrops,
    offerCount: form.offerCount,
    fbaSellerCount: form.fbaSellerCount,
    amazonInStockPercent: form.amazonInStockPercent,
    currentBuyBox: form.currentBuyBox,
    avg30DayPrice: form.avg30DayPrice,
    avg90DayPrice: form.avg90DayPrice,
  }), [form]);

  const marketWrap =
    market.total >= 80 ? "from-emerald-500 to-green-600" :
    market.total >= 65 ? "from-green-500 to-teal-600" :
    market.total >= 50 ? "from-amber-500 to-yellow-600" :
    market.total >= 35 ? "from-orange-500 to-amber-600" :
    "from-rose-500 to-red-600";

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Keepa Practice Lab</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black">Train your chart eye.</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              Log real Keepa charts, write your decision, then mark what actually happened. Volume builds intuition.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-700 text-sm font-semibold hover:scale-105 transition shadow-lg"
          >
            <Plus className="h-4 w-4" /> New Practice Entry
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <LineChart className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Charts Practiced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
            <p className="text-xs text-muted-foreground">Correct Decisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className={`text-2xl font-bold ${stats.accuracy >= 70 ? "text-green-600" : stats.accuracy >= 50 ? "text-yellow-600" : "text-red-600"}`}>{stats.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-red-500 mb-1" />
            <p className="text-xs font-medium text-red-600">Top Mistake:</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{stats.topMistake}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products or ASINs..." className="pl-9 max-w-sm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(k => {
          const isCorrect = k.myDecision === k.correctDecision;
          return (
            <Card key={k.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewEntry(k)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{k.productName}</h3>
                    {k.asin && <p className="text-xs text-muted-foreground font-mono">{k.asin}</p>}
                  </div>
                  {isCorrect
                    ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  }
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Buy Box: </span><span className="font-medium">{formatCurrency(k.currentBuyBox)}</span></div>
                  <div><span className="text-muted-foreground">90D Avg: </span><span className="font-medium">{formatCurrency(k.avg90DayPrice)}</span></div>
                  <div><span className="text-muted-foreground">FBA Sellers: </span><span className={`font-medium ${k.fbaSellerCount <= 15 ? "text-green-600" : "text-red-600"}`}>{k.fbaSellerCount}</span></div>
                  <div><span className="text-muted-foreground">Amazon: </span><span className={`font-medium ${k.amazonInStockPercent < 10 ? "text-green-600" : "text-red-600"}`}>{k.amazonInStockPercent}%</span></div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">My Decision</p>
                    <Badge className={`text-xs ${DECISION_COLORS[k.myDecision]}`}>{DECISION_LABELS[k.myDecision]}</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-0.5">Correct</p>
                    <Badge className={`text-xs ${DECISION_COLORS[k.correctDecision]}`}>{DECISION_LABELS[k.correctDecision]}</Badge>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Checklist Score</span>
                    <span>{Object.values(k.checklist).filter(Boolean).length}/{CHECKLIST_ITEMS.length}</span>
                  </div>
                  <Progress value={Object.values(k.checklist).filter(Boolean).length * (100 / CHECKLIST_ITEMS.length)} className="h-1" />
                </div>

                <p className="text-xs text-muted-foreground">{formatDate(k.createdAt)}</p>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No Keepa practice entries yet. Start practicing!</p>
            <Button className="mt-3" onClick={openAdd}>Add First Entry</Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Keepa Entry" : "New Keepa Practice Entry"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Product Name *</Label>
                <Input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product name" />
              </div>
              <div className="space-y-1">
                <Label>ASIN</Label>
                <Input value={form.asin} onChange={e => setForm(f => ({ ...f, asin: e.target.value }))} placeholder="B0XXXXXXXXX" />
              </div>
              <div className="space-y-1">
                <Label>Amazon Link</Label>
                <Input value={form.amazonLink} onChange={e => setForm(f => ({ ...f, amazonLink: e.target.value }))} placeholder="Amazon product URL" />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Input list="keepa-bsr-categories" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Office Products, Pet Supplies..." />
                <datalist id="keepa-bsr-categories">{BSR_CATEGORY_NAMES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
            </div>

            {/* Keepa Data */}
            <div className="border rounded-lg p-3 space-y-3">
              <h4 className="font-semibold text-sm text-blue-600">Keepa Data</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1"><Label className="text-xs">Current Buy Box ($)</Label><Input type="number" step="0.01" value={form.currentBuyBox || ""} onChange={e => setForm(f => ({ ...f, currentBuyBox: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">30D Avg Price ($)</Label><Input type="number" step="0.01" value={form.avg30DayPrice || ""} onChange={e => setForm(f => ({ ...f, avg30DayPrice: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">90D Avg Price ($)</Label><Input type="number" step="0.01" value={form.avg90DayPrice || ""} onChange={e => setForm(f => ({ ...f, avg90DayPrice: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">180D Avg Price ($)</Label><Input type="number" step="0.01" value={form.avg180DayPrice || ""} onChange={e => setForm(f => ({ ...f, avg180DayPrice: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Sales Rank</Label><Input type="number" value={form.salesRank || ""} onChange={e => setForm(f => ({ ...f, salesRank: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Sales Rank Drops (30D)</Label><Input type="number" value={form.salesRankDrops || ""} onChange={e => setForm(f => ({ ...f, salesRankDrops: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Offer Count</Label><Input type="number" value={form.offerCount || ""} onChange={e => setForm(f => ({ ...f, offerCount: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">FBA Seller Count</Label><Input type="number" value={form.fbaSellerCount || ""} onChange={e => setForm(f => ({ ...f, fbaSellerCount: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Amazon In Stock %</Label><Input type="number" value={form.amazonInStockPercent || ""} onChange={e => setForm(f => ({ ...f, amazonInStockPercent: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Review Count</Label><Input type="number" value={form.reviewCount || ""} onChange={e => setForm(f => ({ ...f, reviewCount: +e.target.value }))} /></div>
                <div className="space-y-1"><Label className="text-xs">Rating</Label><Input type="number" step="0.1" max={5} value={form.rating || ""} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))} /></div>
              </div>
            </div>

            {/* ─── Live "What the rules say" verdict ─── */}
            <div className={`rounded-xl p-4 bg-gradient-to-br ${marketWrap} text-white`}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider opacity-80 leading-none">What the rules say</p>
                    <p className="text-xl font-black leading-tight">{market.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black leading-none">{market.total}<span className="text-base opacity-70">/100</span></p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    suggests: <span className="font-bold">{DECISION_LABELS[market.suggestedDecision as KeepaDecision]}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {market.subScores.map(s => (
                  <div key={s.key} className="bg-white/15 rounded-lg p-2">
                    <div className="flex justify-between text-[10px] font-medium mb-1">
                      <span className="opacity-90">{s.label}</span>
                      <span>{s.score}/{s.max}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/25 overflow-hidden">
                      <div className="h-full rounded-full bg-white" style={{ width: `${(s.score / s.max) * 100}%` }} />
                    </div>
                    <p className="text-[9px] opacity-80 mt-1 truncate" title={s.note}>{s.note}</p>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 mt-3">
                {market.redFlags.slice(0, 5).map((r, i) => (
                  <div key={`r-${i}`} className="flex items-start gap-1.5 text-[11px]"><XCircle className="h-3.5 w-3.5 mt-px shrink-0" /><span>{r}</span></div>
                ))}
                {market.greenFlags.slice(0, 5).map((g, i) => (
                  <div key={`g-${i}`} className="flex items-start gap-1.5 text-[11px] opacity-95"><CheckCircle2 className="h-3.5 w-3.5 mt-px shrink-0" /><span>{g}</span></div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]">
                {market.bsr && <span className="px-2 py-0.5 rounded-full bg-white/20">{market.bsr.label}{market.bsr.matchedCategory ? ` · ${market.bsr.matchedCategory}` : ""}</span>}
                {market.salesPerSellerValue !== null && <span className="px-2 py-0.5 rounded-full bg-white/20">~{market.salesPerSellerValue.toFixed(1)} sales/mo for you</span>}
                {market.suggestedDecision !== form.correctDecision && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, correctDecision: market.suggestedDecision as KeepaDecision }))}
                    className="ml-auto px-2 py-0.5 rounded-full bg-white/90 text-slate-800 font-semibold hover:bg-white transition"
                  >
                    use as “Correct Decision”
                  </button>
                )}
              </div>
              <p className="text-[10px] opacity-75 mt-2">Guide only — BSR % depends on category size, and your own criteria win. Make your call first, then compare.</p>
            </div>

            {/* Keepa Checklist */}
            <div className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-green-600">Buy Checklist (Risk Matrix)</h4>
                <span className="text-xs text-muted-foreground">{checklistScore}/{checklistTotal} passed</span>
              </div>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.map(item => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Checkbox
                      id={item.key}
                      checked={form.checklist[item.key] || false}
                      onCheckedChange={() => toggleChecklistItem(item.key)}
                    />
                    <Label htmlFor={item.key} className="text-xs cursor-pointer leading-tight flex-1">
                      <span className="inline-block text-[9px] uppercase tracking-wide text-muted-foreground/70 mr-1.5 font-semibold">{item.pillar}</span>
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>My Analysis</Label>
                <Textarea value={form.myAnalysis} onChange={e => setForm(f => ({ ...f, myAnalysis: e.target.value }))} placeholder="Describe your full analysis of this product..." rows={3} />
              </div>
              <div className="space-y-1">
                <Label>My Decision</Label>
                <Select value={form.myDecision} onValueChange={v => setForm(f => ({ ...f, myDecision: v as KeepaDecision }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{KEEPA_DECISIONS.map(d => <SelectItem key={d} value={d}>{DECISION_LABELS[d]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Correct Decision (after review)</Label>
                <Select value={form.correctDecision} onValueChange={v => setForm(f => ({ ...f, correctDecision: v as KeepaDecision }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{KEEPA_DECISIONS.map(d => <SelectItem key={d} value={d}>{DECISION_LABELS[d]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>What I Missed</Label>
                <Textarea value={form.whatIMissed} onChange={e => setForm(f => ({ ...f, whatIMissed: e.target.value }))} placeholder="What signals did I miss or misinterpret?" rows={2} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Lesson Learned</Label>
                <Textarea value={form.lessonLearned} onChange={e => setForm(f => ({ ...f, lessonLearned: e.target.value }))} placeholder="What will I do differently next time?" rows={2} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Confidence Score (1-10): {form.confidenceScore}</Label>
                <input type="range" min={1} max={10} value={form.confidenceScore} onChange={e => setForm(f => ({ ...f, confidenceScore: +e.target.value }))} className="w-full" />
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="border rounded-lg p-3 space-y-2">
              <h4 className="font-semibold text-sm text-red-600">Common Mistakes (check all that apply)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {COMMON_MISTAKES.map(m => (
                  <div key={m} className="flex items-center gap-2">
                    <Checkbox
                      id={`m-${m}`}
                      checked={form.mistakes.includes(m)}
                      onCheckedChange={() => toggleMistake(m)}
                    />
                    <Label htmlFor={`m-${m}`} className="text-xs cursor-pointer">{m}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {editingId && <Button variant="destructive" onClick={() => { deleteKeepaEntry(editingId); setDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSave}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewEntry && (
        <Dialog open={!!viewEntry} onOpenChange={() => setViewEntry(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{viewEntry.productName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              {viewEntry.asin && <p className="font-mono text-xs text-muted-foreground">ASIN: {viewEntry.asin}</p>}
              {viewEntry.amazonLink && <a href={viewEntry.amazonLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">View on Amazon</a>}
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted rounded-md p-3">
                <div><span className="text-muted-foreground">Buy Box: </span><span className="font-bold">{formatCurrency(viewEntry.currentBuyBox)}</span></div>
                <div><span className="text-muted-foreground">90D Avg: </span><span className="font-bold">{formatCurrency(viewEntry.avg90DayPrice)}</span></div>
                <div><span className="text-muted-foreground">FBA Sellers: </span><span className="font-bold">{viewEntry.fbaSellerCount}</span></div>
                <div><span className="text-muted-foreground">Amazon %: </span><span className="font-bold">{viewEntry.amazonInStockPercent}%</span></div>
                <div><span className="text-muted-foreground">Rank: </span><span className="font-bold">{viewEntry.salesRank.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Rank Drops: </span><span className="font-bold">{viewEntry.salesRankDrops}</span></div>
              </div>
              <div className="flex gap-4">
                <div><p className="text-xs text-muted-foreground mb-1">My Decision</p><Badge className={DECISION_COLORS[viewEntry.myDecision]}>{DECISION_LABELS[viewEntry.myDecision]}</Badge></div>
                <div><p className="text-xs text-muted-foreground mb-1">Correct</p><Badge className={DECISION_COLORS[viewEntry.correctDecision]}>{DECISION_LABELS[viewEntry.correctDecision]}</Badge></div>
                {viewEntry.myDecision === viewEntry.correctDecision
                  ? <div className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-4 w-4" /><span className="text-xs font-medium">Correct!</span></div>
                  : <div className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /><span className="text-xs font-medium">Wrong</span></div>
                }
              </div>
              {viewEntry.myAnalysis && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">My Analysis</p><p className="whitespace-pre-wrap">{viewEntry.myAnalysis}</p></div>}
              {viewEntry.whatIMissed && <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md"><p className="font-semibold text-xs text-red-600 mb-1">What I Missed</p><p className="text-xs">{viewEntry.whatIMissed}</p></div>}
              {viewEntry.lessonLearned && <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md"><p className="font-semibold text-xs text-green-600 mb-1">Lesson Learned</p><p className="text-xs">{viewEntry.lessonLearned}</p></div>}
              {viewEntry.mistakes.length > 0 && <div><p className="font-semibold text-xs text-red-500 mb-1">Mistakes Made:</p><ul className="list-disc list-inside space-y-0.5">{viewEntry.mistakes.map(m => <li key={m} className="text-xs">{m}</li>)}</ul></div>}
              <Button size="sm" onClick={() => { openEdit(viewEntry); setViewEntry(null); }}>Edit</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
