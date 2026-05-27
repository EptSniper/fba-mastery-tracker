"use client";
import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skill, SkillStatus } from "@/types";
import { CheckCircle2, Circle, Clock, BookOpen } from "lucide-react";

const STATUS_LABELS: Record<SkillStatus, string> = {
  not_started: "Not Started",
  learning: "Learning",
  practicing: "Practicing",
  mastered: "Mastered",
};

const STATUS_COLORS: Record<SkillStatus, string> = {
  not_started: "text-gray-400",
  learning: "text-blue-500",
  practicing: "text-yellow-500",
  mastered: "text-green-500",
};

const STATUS_BG: Record<SkillStatus, string> = {
  not_started: "bg-gray-50 dark:bg-gray-900/20",
  learning: "bg-blue-50 dark:bg-blue-900/20",
  practicing: "bg-yellow-50 dark:bg-yellow-900/20",
  mastered: "bg-green-50 dark:bg-green-900/20",
};

const STATUS_ICONS: Record<SkillStatus, React.ElementType> = {
  not_started: Circle,
  learning: BookOpen,
  practicing: Clock,
  mastered: CheckCircle2,
};

function SkillRow({ skill }: { skill: Skill }) {
  const { updateSkill } = useStore();
  const StatusIcon = STATUS_ICONS[skill.status];

  return (
    <div className={`flex items-center gap-3 p-3 rounded-md ${STATUS_BG[skill.status]} border border-transparent hover:border-border transition-colors`}>
      <StatusIcon className={`h-5 w-5 shrink-0 ${STATUS_COLORS[skill.status]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{skill.skillName}</p>
        {skill.confidenceScore > 0 && (
          <div className="flex gap-0.5 mt-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`w-2 h-1.5 rounded-sm ${i < skill.confidenceScore ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />
            ))}
          </div>
        )}
      </div>
      <Select value={skill.status} onValueChange={v => updateSkill(skill.id, { status: v as SkillStatus })}>
        <SelectTrigger className="w-[120px] h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not_started">Not Started</SelectItem>
          <SelectItem value="learning">Learning</SelectItem>
          <SelectItem value="practicing">Practicing</SelectItem>
          <SelectItem value="mastered">Mastered</SelectItem>
        </SelectContent>
      </Select>
      <input
        type="range"
        min={0}
        max={10}
        value={skill.confidenceScore}
        onChange={e => updateSkill(skill.id, { confidenceScore: +e.target.value })}
        className="w-20 hidden md:block"
        title={`Confidence: ${skill.confidenceScore}/10`}
      />
    </div>
  );
}

export default function SkillsPage() {
  const { skills } = useStore();

  const categories = useMemo(() => {
    const cats = [...new Set(skills.map(s => s.category))];
    return cats.map(cat => {
      const catSkills = skills.filter(s => s.category === cat);
      const mastered = catSkills.filter(s => s.status === "mastered").length;
      const learning = catSkills.filter(s => s.status === "learning" || s.status === "practicing").length;
      const total = catSkills.length;
      const progress = total > 0 ? Math.round(((mastered + learning * 0.5) / total) * 100) : 0;
      return { cat, catSkills, mastered, learning, total, progress };
    });
  }, [skills]);

  const totalMastered = skills.filter(s => s.status === "mastered").length;
  const totalLearning = skills.filter(s => s.status === "learning" || s.status === "practicing").length;
  const overallProgress = skills.length > 0 ? Math.round(((totalMastered + totalLearning * 0.5) / skills.length) * 100) : 0;

  function markAllInCategory(cat: string, status: SkillStatus) {
    const { skills: allSkills, updateSkill: update } = useStore.getState();
    allSkills.filter(s => s.category === cat).forEach(s => update(s.id, { status }));
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="relative text-white">
          <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Skill Checklist</span>
          <h1 className="text-3xl lg:text-4xl font-black mt-1">Honest self-assessment.</h1>
          <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
            Every skill you mark mastered, you should be able to teach. Be brutal.
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Overall Skill Progress</span>
            <span className="text-xl font-bold text-blue-600">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex gap-6 mt-3 text-sm">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-green-600 font-medium">{totalMastered} mastered</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-blue-600 font-medium">{totalLearning} learning</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-300" /><span className="text-muted-foreground">{skills.length - totalMastered - totalLearning} not started</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.map(({ cat, catSkills, mastered, total, progress }) => (
        <Card key={cat}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{cat}</CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{mastered}/{total} mastered</span>
                <span className={`text-lg font-bold ${progress >= 80 ? "text-green-600" : progress >= 50 ? "text-blue-600" : "text-gray-400"}`}>{progress}%</span>
              </div>
            </div>
            <Progress value={progress} className="h-1.5"
              indicatorClassName={progress >= 80 ? "bg-green-500" : progress >= 50 ? "bg-blue-500" : "bg-yellow-500"} />
          </CardHeader>
          <CardContent className="space-y-2">
            {catSkills.map(skill => <SkillRow key={skill.id} skill={skill} />)}
          </CardContent>
        </Card>
      ))}

      {skills.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No skills loaded. Make sure you have initialized the app.</p>
        </div>
      )}
    </div>
  );
}
