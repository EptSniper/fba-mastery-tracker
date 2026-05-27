"use client";
import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Competitor, SellerType } from "@/types";
import { Plus, Search, ExternalLink, Users } from "lucide-react";

const SELLER_TYPE_LABELS: Record<SellerType, string> = {
  wholesale: "Wholesale",
  online_arbitrage: "Online Arbitrage",
  retail_arbitrage: "Retail Arbitrage",
  private_label: "Private Label",
  mixed: "Mixed",
  mega: "Mega Seller",
  not_useful: "Not Useful",
};

const SELLER_TYPE_COLORS: Record<SellerType, string> = {
  wholesale: "text-blue-600 bg-blue-50 border-blue-200",
  online_arbitrage: "text-purple-600 bg-purple-50 border-purple-200",
  retail_arbitrage: "text-orange-600 bg-orange-50 border-orange-200",
  private_label: "text-red-600 bg-red-50 border-red-200",
  mixed: "text-gray-600 bg-gray-50 border-gray-200",
  mega: "text-yellow-700 bg-yellow-50 border-yellow-200",
  not_useful: "text-gray-400 bg-gray-50 border-gray-200",
};

const STATUSES = ["active", "archived", "follow_up"];

const EMPTY_FORM = (): Omit<Competitor, "id" | "createdAt"> => ({
  sellerName: "", storefrontLink: "", marketplace: "Amazon US",
  mainCategories: [], brandsSold: [], productTypes: [],
  sellerType: "wholesale" as SellerType,
  productsWorthStudying: "", repeatedBrands: "", supplierClues: "",
  notes: "", dateChecked: new Date().toISOString().split("T")[0],
  followUpTask: "", status: "active",
});

export default function CompetitorsPage() {
  const { competitors, addCompetitor, updateCompetitor, deleteCompetitor } = useStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Competitor, "id" | "createdAt">>(EMPTY_FORM());
  const [viewComp, setViewComp] = useState<Competitor | null>(null);
  const [tagInputs, setTagInputs] = useState({ mainCategories: "", brandsSold: "", productTypes: "" });

  const filtered = useMemo(() => competitors.filter(c => {
    const matchSearch = !search || c.sellerName.toLowerCase().includes(search.toLowerCase()) ||
      c.brandsSold.some(b => b.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === "All" || c.sellerType === filterType;
    return matchSearch && matchType;
  }), [competitors, search, filterType]);

  function openAdd() { setForm(EMPTY_FORM()); setEditingId(null); setDialogOpen(true); }
  function openEdit(c: Competitor) {
    const { id, createdAt, ...rest } = c;
    setForm(rest); setEditingId(c.id); setDialogOpen(true);
  }
  function handleSave() {
    if (!form.sellerName) return;
    if (editingId) updateCompetitor(editingId, form);
    else addCompetitor(form);
    setDialogOpen(false);
  }
  function addArrayItem(field: "mainCategories" | "brandsSold" | "productTypes") {
    const val = tagInputs[field].trim();
    if (val && !form[field].includes(val)) {
      setForm(f => ({ ...f, [field]: [...f[field], val] }));
      setTagInputs(t => ({ ...t, [field]: "" }));
    }
  }
  function removeArrayItem(field: "mainCategories" | "brandsSold" | "productTypes", item: string) {
    setForm(f => ({ ...f, [field]: f[field].filter((x: string) => x !== item) }));
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Competitor Research Tracker</h1>
          <p className="text-muted-foreground text-sm">{competitors.length} sellers tracked</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" />Add Seller</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sellers or brands..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Seller type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {Object.entries(SELLER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewComp(c)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{c.sellerName}</h3>
                <Badge className={`text-xs ${SELLER_TYPE_COLORS[c.sellerType]}`}>{SELLER_TYPE_LABELS[c.sellerType]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{c.marketplace}</p>
              {c.brandsSold.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {c.brandsSold.slice(0, 5).map(b => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}
                  {c.brandsSold.length > 5 && <span className="text-xs text-muted-foreground">+{c.brandsSold.length - 5}</span>}
                </div>
              )}
              {c.supplierClues && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-2">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Supplier Clue:</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 line-clamp-2">{c.supplierClues}</p>
                </div>
              )}
              {c.storefrontLink && (
                <a href={c.storefrontLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>
                  <ExternalLink className="h-3 w-3" /> View Storefront
                </a>
              )}
              <p className="text-xs text-muted-foreground">Checked: {formatDate(c.dateChecked)}</p>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No competitors tracked yet. Start studying seller storefronts!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? "Edit Seller" : "Add Competitor"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Seller Name *</Label><Input value={form.sellerName} onChange={e => setForm(f => ({ ...f, sellerName: e.target.value }))} /></div>
              <div className="col-span-2 space-y-1"><Label>Storefront Link</Label><Input value={form.storefrontLink} onChange={e => setForm(f => ({ ...f, storefrontLink: e.target.value }))} placeholder="Amazon storefront URL" /></div>
              <div className="space-y-1"><Label>Marketplace</Label><Input value={form.marketplace} onChange={e => setForm(f => ({ ...f, marketplace: e.target.value }))} defaultValue="Amazon US" /></div>
              <div className="space-y-1"><Label>Seller Type</Label>
                <Select value={form.sellerType} onValueChange={v => setForm(f => ({ ...f, sellerType: v as SellerType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SELLER_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Date Checked</Label><Input type="date" value={form.dateChecked} onChange={e => setForm(f => ({ ...f, dateChecked: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {(["mainCategories", "brandsSold", "productTypes"] as const).map(field => (
              <div key={field} className="space-y-1">
                <Label className="capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                <div className="flex gap-2">
                  <Input value={tagInputs[field]} onChange={e => setTagInputs(t => ({ ...t, [field]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addArrayItem(field)} placeholder="Type and press Enter" />
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem(field)}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form[field].map((item: string) => (
                    <Badge key={item} variant="secondary" className="cursor-pointer text-xs" onClick={() => removeArrayItem(field, item)}>{item} ×</Badge>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-1"><Label>Products Worth Studying</Label><Textarea value={form.productsWorthStudying} onChange={e => setForm(f => ({ ...f, productsWorthStudying: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>Repeated Brands</Label><Textarea value={form.repeatedBrands} onChange={e => setForm(f => ({ ...f, repeatedBrands: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>Supplier Clues</Label><Textarea value={form.supplierClues} onChange={e => setForm(f => ({ ...f, supplierClues: e.target.value }))} placeholder="Where might they be sourcing from?" rows={2} /></div>
            <div className="space-y-1"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>Follow Up Task</Label><Input value={form.followUpTask} onChange={e => setForm(f => ({ ...f, followUpTask: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {editingId && <Button variant="destructive" onClick={() => { deleteCompetitor(editingId); setDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewComp && (
        <Dialog open={!!viewComp} onOpenChange={() => setViewComp(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{viewComp.sellerName}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              <div className="flex gap-2"><Badge className={SELLER_TYPE_COLORS[viewComp.sellerType]}>{SELLER_TYPE_LABELS[viewComp.sellerType]}</Badge></div>
              {viewComp.storefrontLink && <a href={viewComp.storefrontLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs"><ExternalLink className="h-3 w-3" /> View Storefront</a>}
              {viewComp.brandsSold.length > 0 && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Brands Sold</p><div className="flex flex-wrap gap-1">{viewComp.brandsSold.map(b => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}</div></div>}
              {viewComp.supplierClues && <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-md"><p className="font-semibold text-xs text-yellow-700 dark:text-yellow-400 mb-1">Supplier Clues</p><p className="text-xs">{viewComp.supplierClues}</p></div>}
              {viewComp.productsWorthStudying && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Products to Study</p><p className="whitespace-pre-wrap text-xs">{viewComp.productsWorthStudying}</p></div>}
              {viewComp.notes && <div><p className="font-semibold text-xs text-muted-foreground uppercase mb-1">Notes</p><p className="whitespace-pre-wrap text-xs">{viewComp.notes}</p></div>}
              <Button size="sm" onClick={() => { openEdit(viewComp); setViewComp(null); }}>Edit</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
