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
import { formatDate, formatCurrency, calculateNetProfit, calculateROI } from "@/lib/utils";
import { ProductAnalysis, ProductDecision, RiskLevel } from "@/types";
import { Plus, Search, Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

const DECISION_LABELS: Record<ProductDecision, string> = {
  reject: "Reject",
  watchlist: "Watchlist",
  manual_review: "Manual Review",
  buy_test: "Buy Test Quantity",
  reorder_later: "Reorder Later",
};

const DECISION_COLORS: Record<ProductDecision, string> = {
  reject: "text-red-600 bg-red-50 border-red-200",
  watchlist: "text-yellow-700 bg-yellow-50 border-yellow-200",
  manual_review: "text-blue-600 bg-blue-50 border-blue-200",
  buy_test: "text-green-600 bg-green-50 border-green-200",
  reorder_later: "text-purple-600 bg-purple-50 border-purple-200",
};

const EMPTY_FORM = (): Omit<ProductAnalysis, "id" | "createdAt"> => ({
  productTitle: "", asin: "", upc: "", category: "", brand: "", supplierSource: "",
  buyCost: 0, amazonPrice: 0, avg30DayPrice: 0, avg90DayPrice: 0,
  fbaFee: 0, referralFee: 0, inboundShipping: 0, prepCost: 0,
  netProfit: 0, roi: 0, profitMargin: 0, breakEvenPrice: 0, minimumSafePrice: 0,
  estimatedMonthlySales: 0, fbaSellerCount: 0, totalOfferCount: 0,
  amazonPresence: "", offerCountTrend: "", riskLevel: "medium" as RiskLevel,
  oversaturationLevel: "", matchConfidence: "", myDecision: "manual_review" as ProductDecision,
  aiNotes: "", whatILearned: "", score: 0, testQuantity: 10,
});

export default function ProductsPage() {
  const { productAnalyses, addProductAnalysis, updateProductAnalysis, deleteProductAnalysis, settings } = useStore();
  const [search, setSearch] = useState("");
  const [filterDecision, setFilterDecision] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ProductAnalysis, "id" | "createdAt">>(EMPTY_FORM());
  const [viewProduct, setViewProduct] = useState<ProductAnalysis | null>(null);

  const filtered = useMemo(() => productAnalyses.filter(p => {
    const matchSearch = !search || p.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.asin.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchDecision = filterDecision === "All" || p.myDecision === filterDecision;
    return matchSearch && matchDecision;
  }), [productAnalyses, search, filterDecision]);

  const stats = useMemo(() => {
    const buys = productAnalyses.filter(p => p.myDecision === "buy_test" || p.myDecision === "reorder_later");
    const avgROI = buys.length > 0 ? buys.reduce((s, p) => s + p.roi, 0) / buys.length : 0;
    return {
      total: productAnalyses.length,
      buys: buys.length,
      rejected: productAnalyses.filter(p => p.myDecision === "reject").length,
      avgROI: avgROI.toFixed(1),
    };
  }, [productAnalyses]);

  function recalculate(f: Omit<ProductAnalysis, "id" | "createdAt">): Omit<ProductAnalysis, "id" | "createdAt"> {
    const netProfit = calculateNetProfit(f.avg90DayPrice || f.amazonPrice, f.buyCost, f.fbaFee, f.referralFee, f.inboundShipping, f.prepCost);
    const totalCost = f.buyCost + f.inboundShipping + f.prepCost;
    const roi = calculateROI(netProfit, totalCost);
    const profitMargin = f.amazonPrice > 0 ? (netProfit / f.amazonPrice) * 100 : 0;
    const fixedCosts = f.buyCost + f.fbaFee + f.inboundShipping + f.prepCost;
    const referralPct = f.referralFee > 0 && f.amazonPrice > 0 ? f.referralFee / f.amazonPrice : 0.15;
    const breakEvenPrice = referralPct < 1 ? fixedCosts / (1 - referralPct) : fixedCosts;
    const minimumSafePrice = breakEvenPrice + settings.minProfit;
    const score = Math.min(100, Math.max(0,
      (roi >= settings.preferredROI ? 20 : roi >= settings.minROI ? 10 : 0) +
      (netProfit >= settings.minProfit * 2 ? 20 : netProfit >= settings.minProfit ? 10 : 0) +
      (f.fbaSellerCount >= 3 && f.fbaSellerCount <= 15 ? 20 : f.fbaSellerCount <= 25 ? 10 : 0) +
      (f.riskLevel === "low" ? 15 : f.riskLevel === "medium" ? 8 : 0) +
      (f.estimatedMonthlySales > 10 ? 15 : f.estimatedMonthlySales > 5 ? 8 : 0) +
      10
    ));
    return { ...f, netProfit, roi, profitMargin, breakEvenPrice, minimumSafePrice, score };
  }

  function handleFieldChange(field: string, value: number | string) {
    setForm(f => {
      const updated = { ...f, [field]: value };
      return recalculate(updated);
    });
  }

  function openAdd() {
    setForm(EMPTY_FORM());
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(p: ProductAnalysis) {
    const { id, createdAt, ...rest } = p;
    setForm(rest);
    setEditingId(p.id);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.productTitle) return;
    const calculated = recalculate(form);
    if (editingId) updateProductAnalysis(editingId, calculated);
    else addProductAnalysis(calculated);
    setDialogOpen(false);
  }

  const roi = form.roi;
  const roiColor = roi >= settings.preferredROI ? "text-green-600" : roi >= settings.minROI ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Deal Analyzer</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black">Every analysis trains your gut.</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              Plug in numbers, log your decision, learn from outcomes. The math is half — the pattern recognition is the other half.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-teal-700 text-sm font-semibold hover:scale-105 transition shadow-lg"
          >
            <Plus className="h-4 w-4" /> New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4 text-center"><Package className="h-5 w-5 text-blue-500 mx-auto mb-1" /><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Analyzed</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" /><p className="text-2xl font-bold text-green-600">{stats.buys}</p><p className="text-xs text-muted-foreground">Decided to Buy</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><AlertTriangle className="h-5 w-5 text-red-500 mx-auto mb-1" /><p className="text-2xl font-bold text-red-600">{stats.rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><DollarSign className="h-5 w-5 text-purple-500 mx-auto mb-1" /><p className="text-2xl font-bold text-purple-600">{stats.avgROI}%</p><p className="text-xs text-muted-foreground">Avg ROI (Buys)</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterDecision} onValueChange={setFilterDecision}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Decision" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Decisions</SelectItem>
            {Object.entries(DECISION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewProduct(p)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">{p.productTitle}</h3>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                </div>
                <Badge className={`text-xs shrink-0 ${DECISION_COLORS[p.myDecision]}`}>{DECISION_LABELS[p.myDecision]}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center bg-muted rounded p-1.5">
                  <p className={`font-bold ${p.roi >= settings.minROI ? "text-green-600" : "text-red-600"}`}>{p.roi.toFixed(1)}%</p>
                  <p className="text-muted-foreground">ROI</p>
                </div>
                <div className="text-center bg-muted rounded p-1.5">
                  <p className={`font-bold ${p.netProfit >= settings.minProfit ? "text-green-600" : "text-red-600"}`}>{formatCurrency(p.netProfit)}</p>
                  <p className="text-muted-foreground">Profit</p>
                </div>
                <div className="text-center bg-muted rounded p-1.5">
                  <p className={`font-bold ${p.score >= 70 ? "text-green-600" : p.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>{p.score}</p>
                  <p className="text-muted-foreground">Score</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                <span>Buy: {formatCurrency(p.buyCost)}</span>
                <span>Sell: {formatCurrency(p.amazonPrice)}</span>
                <span>FBA: {formatCurrency(p.fbaFee)}</span>
                <span>Sellers: {p.fbaSellerCount}</span>
              </div>

              <div className="flex gap-2">
                <Badge variant={p.riskLevel === "low" ? "success" : p.riskLevel === "medium" ? "warning" : "destructive"} className="text-xs">{p.riskLevel} risk</Badge>
                {p.asin && <span className="text-xs text-muted-foreground font-mono">{p.asin}</span>}
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No products analyzed yet. Start practicing your product research!</p>
            <Button className="mt-3" onClick={openAdd}>Analyze First Product</Button>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Analysis" : "New Product Analysis"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Product Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Product Title *</Label><Input value={form.productTitle} onChange={e => setForm(f => ({ ...f, productTitle: e.target.value }))} /></div>
              <div className="space-y-1"><Label>ASIN</Label><Input value={form.asin} onChange={e => setForm(f => ({ ...f, asin: e.target.value }))} placeholder="B0XXXXXXXXX" /></div>
              <div className="space-y-1"><Label>UPC</Label><Input value={form.upc} onChange={e => setForm(f => ({ ...f, upc: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Brand</Label><Input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>Supplier / Source</Label><Input value={form.supplierSource} onChange={e => setForm(f => ({ ...f, supplierSource: e.target.value }))} /></div>
            </div>

            {/* Financials */}
            <div className="border rounded-lg p-3 space-y-3">
              <h4 className="font-semibold text-sm text-blue-600">Financial Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1"><Label className="text-xs">Buy Cost ($) *</Label><Input type="number" step="0.01" value={form.buyCost || ""} onChange={e => handleFieldChange("buyCost", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Amazon Price ($)</Label><Input type="number" step="0.01" value={form.amazonPrice || ""} onChange={e => handleFieldChange("amazonPrice", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">30D Avg ($)</Label><Input type="number" step="0.01" value={form.avg30DayPrice || ""} onChange={e => handleFieldChange("avg30DayPrice", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">90D Avg ($) *</Label><Input type="number" step="0.01" value={form.avg90DayPrice || ""} onChange={e => handleFieldChange("avg90DayPrice", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">FBA Fee ($)</Label><Input type="number" step="0.01" value={form.fbaFee || ""} onChange={e => handleFieldChange("fbaFee", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Referral Fee ($)</Label><Input type="number" step="0.01" value={form.referralFee || ""} onChange={e => handleFieldChange("referralFee", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Inbound Ship ($)</Label><Input type="number" step="0.01" value={form.inboundShipping || ""} onChange={e => handleFieldChange("inboundShipping", +e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Prep Cost ($)</Label><Input type="number" step="0.01" value={form.prepCost || ""} onChange={e => handleFieldChange("prepCost", +e.target.value)} /></div>
              </div>

              {/* Calculated Results */}
              <div className="bg-muted rounded-md p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Net Profit</p><p className={`font-bold ${form.netProfit >= settings.minProfit ? "text-green-600" : "text-red-600"}`}>{formatCurrency(form.netProfit)}</p></div>
                <div><p className="text-xs text-muted-foreground">ROI</p><p className={`font-bold ${roiColor}`}>{form.roi.toFixed(1)}%</p></div>
                <div><p className="text-xs text-muted-foreground">Break Even</p><p className="font-bold">{formatCurrency(form.breakEvenPrice)}</p></div>
                <div><p className="text-xs text-muted-foreground">Min Safe Price</p><p className="font-bold">{formatCurrency(form.minimumSafePrice)}</p></div>
                <div><p className="text-xs text-muted-foreground">Test Qty Profit</p><p className="font-bold text-blue-600">{formatCurrency(form.netProfit * form.testQuantity)}</p></div>
                <div><p className="text-xs text-muted-foreground">Capital Needed</p><p className="font-bold">{formatCurrency(form.buyCost * form.testQuantity)}</p></div>
                <div><p className="text-xs text-muted-foreground">Score</p><p className={`font-bold ${form.score >= 70 ? "text-green-600" : form.score >= 50 ? "text-yellow-600" : "text-red-600"}`}>{form.score}/100</p></div>
              </div>
            </div>

            {/* Market Data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label className="text-xs">FBA Seller Count</Label><Input type="number" value={form.fbaSellerCount || ""} onChange={e => handleFieldChange("fbaSellerCount", +e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Total Offer Count</Label><Input type="number" value={form.totalOfferCount || ""} onChange={e => setForm(f => ({ ...f, totalOfferCount: +e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Monthly Sales Est.</Label><Input type="number" value={form.estimatedMonthlySales || ""} onChange={e => setForm(f => ({ ...f, estimatedMonthlySales: +e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Test Quantity</Label><Input type="number" value={form.testQuantity || ""} onChange={e => setForm(f => ({ ...f, testQuantity: +e.target.value }))} /></div>
              <div className="space-y-1"><Label className="text-xs">Amazon Presence</Label>
                <Select value={form.amazonPresence} onValueChange={v => setForm(f => ({ ...f, amazonPresence: v }))}>
                  <SelectTrigger><SelectValue placeholder="Amazon in stock?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never in stock</SelectItem>
                    <SelectItem value="rarely">Rarely (&lt;10%)</SelectItem>
                    <SelectItem value="sometimes">Sometimes (10-50%)</SelectItem>
                    <SelectItem value="often">Often (50%+)</SelectItem>
                    <SelectItem value="dominant">Dominant (90%+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Offer Trend</Label>
                <Select value={form.offerCountTrend} onValueChange={v => setForm(f => ({ ...f, offerCountTrend: v }))}>
                  <SelectTrigger><SelectValue placeholder="Offer count trend" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="declining">Declining</SelectItem>
                    <SelectItem value="stable">Stable</SelectItem>
                    <SelectItem value="growing_slowly">Growing Slowly</SelectItem>
                    <SelectItem value="exploding">Exploding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Risk Level</Label>
                <Select value={form.riskLevel} onValueChange={v => setForm(f => ({ ...f, riskLevel: v as RiskLevel }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">My Decision</Label>
                <Select value={form.myDecision} onValueChange={v => setForm(f => ({ ...f, myDecision: v as ProductDecision }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(DECISION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1"><Label>What I Learned</Label><Textarea value={form.whatILearned} onChange={e => setForm(f => ({ ...f, whatILearned: e.target.value }))} placeholder="Key lessons from analyzing this product..." rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {editingId && <Button variant="destructive" onClick={() => { deleteProductAnalysis(editingId); setDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSave}>Save Analysis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewProduct && (
        <Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{viewProduct.productTitle}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                <Badge className={DECISION_COLORS[viewProduct.myDecision]}>{DECISION_LABELS[viewProduct.myDecision]}</Badge>
                <Badge variant={viewProduct.riskLevel === "low" ? "success" : viewProduct.riskLevel === "medium" ? "warning" : "destructive"}>{viewProduct.riskLevel} risk</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 bg-muted rounded-md p-3 text-xs">
                <div><span className="text-muted-foreground">Buy Cost: </span><span className="font-bold">{formatCurrency(viewProduct.buyCost)}</span></div>
                <div><span className="text-muted-foreground">Amazon Price: </span><span className="font-bold">{formatCurrency(viewProduct.amazonPrice)}</span></div>
                <div><span className="text-muted-foreground">Net Profit: </span><span className={`font-bold ${viewProduct.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(viewProduct.netProfit)}</span></div>
                <div><span className="text-muted-foreground">ROI: </span><span className={`font-bold ${viewProduct.roi >= 30 ? "text-green-600" : "text-red-600"}`}>{viewProduct.roi.toFixed(1)}%</span></div>
                <div><span className="text-muted-foreground">FBA Sellers: </span><span className="font-bold">{viewProduct.fbaSellerCount}</span></div>
                <div><span className="text-muted-foreground">Score: </span><span className="font-bold">{viewProduct.score}/100</span></div>
              </div>
              {viewProduct.whatILearned && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">What I Learned</p><p className="whitespace-pre-wrap">{viewProduct.whatILearned}</p></div>}
              <Button size="sm" onClick={() => { openEdit(viewProduct); setViewProduct(null); }}>Edit</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
