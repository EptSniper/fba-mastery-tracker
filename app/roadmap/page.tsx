"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { ROADMAP_LEVELS } from "@/lib/data/roadmap-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RoadmapLesson, SkillStatus } from "@/types";
import { CheckCircle2, Circle, Clock, BookOpen, ChevronDown, ChevronRight, Map } from "lucide-react";

const STATUS_COLORS: Record<SkillStatus, string> = {
  not_started: "text-gray-400",
  learning: "text-blue-500",
  practicing: "text-yellow-500",
  mastered: "text-green-500",
};

const STATUS_ICONS: Record<SkillStatus, React.ElementType> = {
  not_started: Circle,
  learning: BookOpen,
  practicing: Clock,
  mastered: CheckCircle2,
};

const STATUS_LABELS: Record<SkillStatus, string> = {
  not_started: "Not Started",
  learning: "Learning",
  practicing: "Practicing",
  mastered: "Mastered",
};

const STATUS_BADGE: Record<SkillStatus, "muted" | "info" | "warning" | "success"> = {
  not_started: "muted",
  learning: "info",
  practicing: "warning",
  mastered: "success",
};

export default function RoadmapPage() {
  const { roadmapProgress, updateRoadmapLesson } = useStore();
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(["level-1"]));
  const [editingLesson, setEditingLesson] = useState<RoadmapLesson | null>(null);
  const [editForm, setEditForm] = useState<{ status: SkillStatus; notes: string; confidenceScore: number }>({ status: "not_started", notes: "", confidenceScore: 0 });

  function getLessonData(lesson: RoadmapLesson): RoadmapLesson {
    const progress = roadmapProgress[lesson.id];
    if (!progress) return lesson;
    return { ...lesson, ...progress };
  }

  function getLevelProgress(level: (typeof ROADMAP_LEVELS)[0]) {
    const lessons = level.lessons.map(l => getLessonData(l));
    const mastered = lessons.filter(l => l.status === "mastered").length;
    const learning = lessons.filter(l => l.status === "learning" || l.status === "practicing").length;
    const total = lessons.length;
    const progress = total > 0 ? Math.round(((mastered + learning * 0.5) / total) * 100) : 0;
    return { mastered, learning, total, progress };
  }

  function toggleLevel(levelId: string) {
    setExpandedLevels(prev => {
      const next = new Set(prev);
      if (next.has(levelId)) next.delete(levelId);
      else next.add(levelId);
      return next;
    });
  }

  function openEdit(lesson: RoadmapLesson) {
    const data = getLessonData(lesson);
    setEditForm({ status: data.status, notes: data.notes, confidenceScore: data.confidenceScore });
    setEditingLesson(lesson);
  }

  function handleSave() {
    if (!editingLesson) return;
    updateRoadmapLesson(editingLesson.id, editForm);
    setEditingLesson(null);
  }

  const totalStats = ROADMAP_LEVELS.reduce((acc, level) => {
    const p = getLevelProgress(level);
    acc.mastered += p.mastered;
    acc.total += p.total;
    return acc;
  }, { mastered: 0, total: 0 });

  const overallProgress = totalStats.total > 0 ? Math.round((totalStats.mastered / totalStats.total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Learning Roadmap</h1>
        <p className="text-muted-foreground text-sm">7 levels · {totalStats.total} lessons · Your path to FBA mastery</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Overall Progress</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="text-green-600 font-medium">{totalStats.mastered} mastered</span>
            <span>of {totalStats.total} lessons</span>
          </div>
        </CardContent>
      </Card>

      {/* Level Cards */}
      {ROADMAP_LEVELS.map((level, levelIdx) => {
        const { mastered, learning, total, progress } = getLevelProgress(level);
        const isExpanded = expandedLevels.has(level.id);
        const levelColor = progress >= 80 ? "border-green-300 dark:border-green-700" : progress >= 50 ? "border-blue-300 dark:border-blue-700" : "border-border";

        return (
          <Card key={level.id} className={`border-2 ${levelColor}`}>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleLevel(level.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-blue-500" : progress > 0 ? "bg-yellow-500" : "bg-gray-400"}`}>
                    {levelIdx + 1}
                  </div>
                  <div>
                    <CardTitle className="text-base">{level.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{level.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold">{progress}%</div>
                    <div className="text-xs text-muted-foreground">{mastered}/{total}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>
              <Progress value={progress} className="h-1.5 mt-2"
                indicatorClassName={progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-blue-500" : "bg-yellow-500"} />
            </CardHeader>

            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {level.lessons.map(lesson => {
                    const data = getLessonData(lesson);
                    const StatusIcon = STATUS_ICONS[data.status];
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                        onClick={() => openEdit(lesson)}
                      >
                        <StatusIcon className={`h-5 w-5 shrink-0 ${STATUS_COLORS[data.status]}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{lesson.title}</span>
                            <Badge variant={STATUS_BADGE[data.status]} className="text-xs">{STATUS_LABELS[data.status]}</Badge>
                          </div>
                          {data.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{data.notes}</p>}
                          {data.confidenceScore > 0 && (
                            <div className="flex gap-1 mt-1">
                              {[...Array(10)].map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i < data.confidenceScore ? "bg-blue-500" : "bg-gray-200"}`} />
                              ))}
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 h-7 text-xs">Update</Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Edit Dialog */}
      {editingLesson && (
        <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingLesson.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v as SkillStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="practicing">Practicing</SelectItem>
                    <SelectItem value="mastered">Mastered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Confidence Score (1-10): {editForm.confidenceScore}</Label>
                <input type="range" min={0} max={10} value={editForm.confidenceScore} onChange={e => setEditForm(f => ({ ...f, confidenceScore: +e.target.value }))} className="w-full" />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="What have you learned? What do you need to practice?" rows={3} />
              </div>

              {/* Quick status buttons */}
              <div>
                <Label className="text-xs text-muted-foreground">Quick set:</Label>
                <div className="flex gap-2 mt-1">
                  {(["learning", "practicing", "mastered"] as SkillStatus[]).map(s => (
                    <Button key={s} size="sm" variant={editForm.status === s ? "default" : "outline"} className="text-xs h-7" onClick={() => setEditForm(f => ({ ...f, status: s }))}>
                      {STATUS_LABELS[s]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingLesson(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save Progress</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
