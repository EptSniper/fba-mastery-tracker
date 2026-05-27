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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { Brand, Supplier, SupplierStatus, RiskLevel } from "@/types";
import { Plus, Search, ExternalLink, Building2, Tag } from "lucide-react";

const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  new: "New", researching: "Researching", contacted: "Contacted",
  price_sheet_received: "Price Sheet", approved: "Approved", rejected: "Rejected",
};

const SUPPLIER_STATUS_COLORS: Record<SupplierStatus, string> = {
  new: "text-gray-600 bg-gray-50 border-gray-200",
  researching: "text-blue-600 bg-blue-50 border-blue-200",
  contacted: "text-yellow-700 bg-yellow-50 border-yellow-200",
  price_sheet_received: "text-purple-600 bg-purple-50 border-purple-200",
  approved: "text-green-600 bg-green-50 border-green-200",
  rejected: "text-red-600 bg-red-50 border-red-200",
};

const SUPPLIER_TYPES = ["brand_direct", "distributor", "closeout", "retailer", "marketplace", "unknown"];

const EMPTY_SUPPLIER = (): Omit<Supplier, "id" | "createdAt"> => ({
  supplierName: "", website: "", supplierType: "distributor", contactPage: "",
  wholesalePage: "", moq: "", brandsCarried: "", productsFound: "", notes: "",
  contactStatus: "new" as SupplierStatus,
});

const EMPTY_BRAND = (): Omit<Brand, "id" | "createdAt"> => ({
  brandName: "", category: "", productsFound: "", competitorsSelling: "",
  amazonPresence: "", riskLevel: "medium" as RiskLevel, supplierFound: false,
  wholesalePotential: "", notes: "", status: "researching",
});

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, brands, addBrand, updateBrand, deleteBrand } = useStore();
  const [tab, setTab] = useState("suppliers");
  const [search, setSearch] = useState("");
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, "id" | "createdAt">>(EMPTY_SUPPLIER());
  const [brandForm, setBrandForm] = useState<Omit<Brand, "id" | "createdAt">>(EMPTY_BRAND());

  const filteredSuppliers = useMemo(() => suppliers.filter(s =>
    !search || s.supplierName.toLowerCase().includes(search.toLowerCase()) || s.brandsCarried.toLowerCase().includes(search.toLowerCase())
  ), [suppliers, search]);

  const filteredBrands = useMemo(() => brands.filter(b =>
    !search || b.brandName.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase())
  ), [brands, search]);

  function openAddSupplier() { setSupplierForm(EMPTY_SUPPLIER()); setEditingSupId(null); setSupplierDialogOpen(true); }
  function openEditSupplier(s: Supplier) { const { id, createdAt, ...rest } = s; setSupplierForm(rest); setEditingSupId(s.id); setSupplierDialogOpen(true); }
  function handleSaveSupplier() { if (!supplierForm.supplierName) return; if (editingSupId) updateSupplier(editingSupId, supplierForm); else addSupplier(supplierForm); setSupplierDialogOpen(false); }

  function openAddBrand() { setBrandForm(EMPTY_BRAND()); setEditingBrandId(null); setBrandDialogOpen(true); }
  function openEditBrand(b: Brand) { const { id, createdAt, ...rest } = b; setBrandForm(rest); setEditingBrandId(b.id); setBrandDialogOpen(true); }
  function handleSaveBrand() { if (!brandForm.brandName) return; if (editingBrandId) updateBrand(editingBrandId, brandForm); else addBrand(brandForm); setBrandDialogOpen(false); }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier & Brand Tracker</h1>
          <p className="text-muted-foreground text-sm">{suppliers.length} suppliers · {brands.length} brands tracked</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openAddBrand}><Plus className="h-4 w-4" />Add Brand</Button>
          <Button onClick={openAddSupplier}><Plus className="h-4 w-4" />Add Supplier</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="brands">Brands ({brands.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(s => (
              <Card key={s.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEditSupplier(s)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{s.supplierName}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{s.supplierType.replace("_", " ")}</p>
                    </div>
                    <Badge className={`text-xs ${SUPPLIER_STATUS_COLORS[s.contactStatus]}`}>{SUPPLIER_STATUS_LABELS[s.contactStatus]}</Badge>
                  </div>
                  {s.brandsCarried && <p className="text-xs text-muted-foreground line-clamp-2"><span className="font-medium">Brands:</span> {s.brandsCarried}</p>}
                  {s.moq && <p className="text-xs text-muted-foreground"><span className="font-medium">MOQ:</span> {s.moq}</p>}
                  {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline" onClick={e => e.stopPropagation()}><ExternalLink className="h-3 w-3" /> Website</a>}
                </CardContent>
              </Card>
            ))}
            {filteredSuppliers.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No suppliers tracked yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="brands" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map(b => (
              <Card key={b.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEditBrand(b)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{b.brandName}</h3>
                      <p className="text-xs text-muted-foreground">{b.category}</p>
                    </div>
                    <Badge variant={b.riskLevel === "low" ? "success" : b.riskLevel === "medium" ? "warning" : "destructive"} className="text-xs">{b.riskLevel} risk</Badge>
                  </div>
                  {b.wholesalePotential && <p className="text-xs text-muted-foreground line-clamp-2"><span className="font-medium">Wholesale:</span> {b.wholesalePotential}</p>}
                  <div className="flex gap-2">
                    {b.supplierFound && <Badge variant="success" className="text-xs">Supplier Found</Badge>}
                    <Badge variant="muted" className="text-xs">{b.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredBrands.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No brands tracked yet.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Supplier Dialog */}
      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingSupId ? "Edit Supplier" : "Add Supplier"}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Supplier Name *</Label><Input value={supplierForm.supplierName} onChange={e => setSupplierForm(f => ({ ...f, supplierName: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Website</Label><Input value={supplierForm.website} onChange={e => setSupplierForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." /></div>
              <div className="space-y-1"><Label>Supplier Type</Label>
                <Select value={supplierForm.supplierType} onValueChange={v => setSupplierForm(f => ({ ...f, supplierType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUPPLIER_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Contact Status</Label>
                <Select value={supplierForm.contactStatus} onValueChange={v => setSupplierForm(f => ({ ...f, contactStatus: v as SupplierStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(SUPPLIER_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>MOQ</Label><Input value={supplierForm.moq} onChange={e => setSupplierForm(f => ({ ...f, moq: e.target.value }))} placeholder="Min order quantity" /></div>
              <div className="col-span-2 space-y-1"><Label>Brands Carried</Label><Textarea value={supplierForm.brandsCarried} onChange={e => setSupplierForm(f => ({ ...f, brandsCarried: e.target.value }))} rows={2} /></div>
              <div className="col-span-2 space-y-1"><Label>Products Found</Label><Textarea value={supplierForm.productsFound} onChange={e => setSupplierForm(f => ({ ...f, productsFound: e.target.value }))} rows={2} /></div>
              <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={supplierForm.notes} onChange={e => setSupplierForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <div className="space-y-1"><Label>Contact Page</Label><Input value={supplierForm.contactPage} onChange={e => setSupplierForm(f => ({ ...f, contactPage: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Wholesale Page</Label><Input value={supplierForm.wholesalePage} onChange={e => setSupplierForm(f => ({ ...f, wholesalePage: e.target.value }))} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierDialogOpen(false)}>Cancel</Button>
            {editingSupId && <Button variant="destructive" onClick={() => { deleteSupplier(editingSupId); setSupplierDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSaveSupplier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Brand Dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingBrandId ? "Edit Brand" : "Add Brand"}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1"><Label>Brand Name *</Label><Input value={brandForm.brandName} onChange={e => setBrandForm(f => ({ ...f, brandName: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Category</Label><Input value={brandForm.category} onChange={e => setBrandForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Risk Level</Label>
                <Select value={brandForm.riskLevel} onValueChange={v => setBrandForm(f => ({ ...f, riskLevel: v as RiskLevel }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Amazon Presence</Label><Input value={brandForm.amazonPresence} onChange={e => setBrandForm(f => ({ ...f, amazonPresence: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={brandForm.status} onValueChange={v => setBrandForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="researching">Researching</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="sourced">Sourced</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1"><Label>Products Found</Label><Textarea value={brandForm.productsFound} onChange={e => setBrandForm(f => ({ ...f, productsFound: e.target.value }))} rows={2} /></div>
              <div className="col-span-2 space-y-1"><Label>Competitors Selling</Label><Textarea value={brandForm.competitorsSelling} onChange={e => setBrandForm(f => ({ ...f, competitorsSelling: e.target.value }))} rows={2} /></div>
              <div className="col-span-2 space-y-1"><Label>Wholesale Potential</Label><Textarea value={brandForm.wholesalePotential} onChange={e => setBrandForm(f => ({ ...f, wholesalePotential: e.target.value }))} rows={2} /></div>
              <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea value={brandForm.notes} onChange={e => setBrandForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="supplierFound" checked={brandForm.supplierFound} onChange={e => setBrandForm(f => ({ ...f, supplierFound: e.target.checked }))} />
                <Label htmlFor="supplierFound">Supplier Found</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>Cancel</Button>
            {editingBrandId && <Button variant="destructive" onClick={() => { deleteBrand(editingBrandId); setBrandDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSaveBrand}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
