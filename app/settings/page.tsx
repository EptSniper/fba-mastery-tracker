"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [catInput, setCatInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");

  function handleSave() {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addCategory() {
    if (catInput.trim() && !form.targetCategories.includes(catInput.trim())) {
      setForm(f => ({ ...f, targetCategories: [...f.targetCategories, catInput.trim()] }));
      setCatInput("");
    }
  }

  function removeCategory(cat: string) {
    setForm(f => ({ ...f, targetCategories: f.targetCategories.filter(c => c !== cat) }));
  }

  function addAvoidCategory() {
    if (avoidInput.trim() && !form.avoidCategories.includes(avoidInput.trim())) {
      setForm(f => ({ ...f, avoidCategories: [...f.avoidCategories, avoidInput.trim()] }));
      setAvoidInput("");
    }
  }

  function removeAvoidCategory(cat: string) {
    setForm(f => ({ ...f, avoidCategories: f.avoidCategories.filter(c => c !== cat) }));
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-zinc-700 to-stone-600" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.18),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Settings</span>
            <h1 className="text-3xl lg:text-4xl font-black mt-1">Your buy criteria.</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              These numbers shape every decision in this app. Pick them once. Live by them.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg",
              saved
                ? "bg-emerald-400 text-emerald-900 hover:scale-105"
                : "bg-white text-slate-800 hover:scale-105",
            )}
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      {/* Profit & ROI Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-green-600">Profit & ROI Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Minimum Net Profit ($)</Label>
              <Input type="number" step="0.50" value={form.minProfit} onChange={e => setForm(f => ({ ...f, minProfit: +e.target.value }))} />
              <p className="text-xs text-muted-foreground">Reject products below this profit</p>
            </div>
            <div className="space-y-1">
              <Label>Minimum ROI (%)</Label>
              <Input type="number" value={form.minROI} onChange={e => setForm(f => ({ ...f, minROI: +e.target.value }))} />
              <p className="text-xs text-muted-foreground">Current: {form.minROI}%</p>
            </div>
            <div className="space-y-1">
              <Label>Preferred ROI (%)</Label>
              <Input type="number" value={form.preferredROI} onChange={e => setForm(f => ({ ...f, preferredROI: +e.target.value }))} />
              <p className="text-xs text-muted-foreground">Target: {form.preferredROI}%+</p>
            </div>
            <div className="space-y-1">
              <Label>Max FBA Sellers (preferred)</Label>
              <Input type="number" value={form.maxFBASellers} onChange={e => setForm(f => ({ ...f, maxFBASellers: +e.target.value }))} />
              <p className="text-xs text-muted-foreground">Reject if above this count</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-blue-600">Inventory Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Test Buy Min Quantity</Label>
              <Input type="number" value={form.testBuyQuantityMin} onChange={e => setForm(f => ({ ...f, testBuyQuantityMin: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Test Buy Max Quantity</Label>
              <Input type="number" value={form.testBuyQuantityMax} onChange={e => setForm(f => ({ ...f, testBuyQuantityMax: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Target Sell-Through Min (days)</Label>
              <Input type="number" value={form.targetSellThroughMin} onChange={e => setForm(f => ({ ...f, targetSellThroughMin: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Target Sell-Through Max (days)</Label>
              <Input type="number" value={form.targetSellThroughMax} onChange={e => setForm(f => ({ ...f, targetSellThroughMax: +e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-purple-600">Learning Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Weekly Study Goal (hours)</Label>
            <Input type="number" value={form.weeklyStudyGoal} onChange={e => setForm(f => ({ ...f, weeklyStudyGoal: +e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Learning Goals</Label>
            <Textarea value={form.preferredLearningGoals} onChange={e => setForm(f => ({ ...f, preferredLearningGoals: e.target.value }))} rows={3} placeholder="What do you want to master?" />
          </div>
        </CardContent>
      </Card>

      {/* Target Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-green-600">Target Categories (Focus On)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={catInput} onChange={e => setCatInput(e.target.value)} placeholder="Add category..." onKeyDown={e => e.key === "Enter" && addCategory()} />
            <Button type="button" variant="outline" onClick={addCategory}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.targetCategories.map(cat => (
              <Badge key={cat} variant="success" className="cursor-pointer" onClick={() => removeCategory(cat)}>{cat} ×</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avoid Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-red-600">Categories to Avoid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={avoidInput} onChange={e => setAvoidInput(e.target.value)} placeholder="Add category to avoid..." onKeyDown={e => e.key === "Enter" && addAvoidCategory()} />
            <Button type="button" variant="outline" onClick={addAvoidCategory}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.avoidCategories.map(cat => (
              <Badge key={cat} variant="destructive" className="cursor-pointer" onClick={() => removeAvoidCategory(cat)}>{cat} ×</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Min Profit:</span><span className="font-medium text-green-600">${settings.minProfit}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Min ROI:</span><span className="font-medium text-green-600">{settings.minROI}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Preferred ROI:</span><span className="font-medium text-green-600">{settings.preferredROI}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Max FBA Sellers:</span><span className="font-medium">{settings.maxFBASellers}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Test Qty:</span><span className="font-medium">{settings.testBuyQuantityMin}–{settings.testBuyQuantityMax}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sell Through:</span><span className="font-medium">{settings.targetSellThroughMin}–{settings.targetSellThroughMax} days</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Data Warning */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">All your data is stored locally in your browser using localStorage. It persists between sessions on this browser.</p>
          <p className="text-sm text-muted-foreground">To back up your data, use your browser's developer tools to export the localStorage entry named "fba-mastery-tracker".</p>
          <Button variant="destructive" size="sm" onClick={() => {
            if (confirm("Are you sure you want to reset ALL data? This cannot be undone.")) {
              localStorage.removeItem("fba-mastery-tracker");
              window.location.reload();
            }
          }}>
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" variant={saved ? "success" : "default"}>
          {saved ? "Settings Saved!" : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
