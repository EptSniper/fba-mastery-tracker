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
import { formatDate } from "@/lib/utils";
import { WeeklyPlan, Task, TaskStatus, Priority } from "@/types";
import { Plus, Calendar, CheckSquare, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "text-gray-600 bg-gray-50",
  medium: "text-yellow-700 bg-yellow-50",
  high: "text-red-600 bg-red-50",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "text-gray-600",
  in_progress: "text-blue-600",
  completed: "text-green-600",
};

const STATUS_ICONS: Record<TaskStatus, React.ElementType> = {
  todo: Clock,
  in_progress: AlertTriangle,
  completed: CheckCircle2,
};

const EMPTY_PLAN = (): Omit<WeeklyPlan, "id" | "createdAt"> => ({
  weekStartDate: new Date().toISOString().split("T")[0],
  mainFocus: "", videosToWatch: "", notesToTake: "",
  keepaChartsToPractice: 5, productsToAnalyze: 3,
  competitorsToStudy: 2, suppliersToResearch: 1,
  skillsToImprove: "", reflection: "", tasks: [],
});

const EMPTY_TASK = (): Omit<Task, "id" | "createdAt"> => ({
  title: "", category: "Keepa", dueDate: new Date().toISOString().split("T")[0],
  status: "todo", priority: "medium", notes: "",
});

const TASK_CATEGORIES = ["Keepa", "SellerAmp", "Product Research", "Videos", "Notes", "Competitors", "Suppliers", "Inventory", "Other"];

export default function PlannerPage() {
  const { weeklyPlans, addWeeklyPlan, updateWeeklyPlan, deleteWeeklyPlan, tasks, addTask, updateTask, deleteTask } = useStore();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [planForm, setPlanForm] = useState<Omit<WeeklyPlan, "id" | "createdAt">>(EMPTY_PLAN());
  const [taskForm, setTaskForm] = useState<Omit<Task, "id" | "createdAt">>(EMPTY_TASK());
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(t => t.dueDate === today && t.status !== "completed");
  const overdueTasks = tasks.filter(t => t.dueDate < today && t.status !== "completed");
  const upcomingTasks = tasks.filter(t => t.dueDate > today && t.status !== "completed").slice(0, 5);

  const currentWeek = weeklyPlans.find(p => p.weekStartDate <= today && new Date(p.weekStartDate).getTime() + 7 * 24 * 60 * 60 * 1000 > new Date(today).getTime());

  function openAddPlan() { setPlanForm(EMPTY_PLAN()); setEditingPlanId(null); setPlanDialogOpen(true); }
  function openEditPlan(p: WeeklyPlan) { const { id, createdAt, ...rest } = p; setPlanForm(rest); setEditingPlanId(p.id); setPlanDialogOpen(true); }
  function handleSavePlan() { if (!planForm.weekStartDate) return; if (editingPlanId) updateWeeklyPlan(editingPlanId, planForm); else addWeeklyPlan(planForm); setPlanDialogOpen(false); }

  function openAddTask() { setTaskForm(EMPTY_TASK()); setEditingTaskId(null); setTaskDialogOpen(true); }
  function openEditTask(t: Task) { const { id, createdAt, ...rest } = t; setTaskForm(rest); setEditingTaskId(t.id); setTaskDialogOpen(true); }
  function handleSaveTask() { if (!taskForm.title) return; if (editingTaskId) updateTask(editingTaskId, taskForm); else addTask(taskForm); setTaskDialogOpen(false); }

  function TaskCard({ task }: { task: Task }) {
    const StatusIcon = STATUS_ICONS[task.status];
    return (
      <div className={`flex items-center gap-3 p-2.5 rounded-md border ${task.status === "completed" ? "opacity-60" : ""}`}>
        <StatusIcon className={`h-4 w-4 shrink-0 ${STATUS_COLORS[task.status]}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>{task.category}</span>
            <span>·</span>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        </div>
        <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</Badge>
        <div className="flex gap-1">
          {task.status !== "completed" && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600" onClick={() => updateTask(task.id, { status: "completed" })}>Done</Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => openEditTask(task)}>Edit</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4 text-white">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase opacity-90">Weekly Planner</span>
            <h1 className="text-3xl lg:text-4xl font-black mt-1">Schedule the reps.</h1>
            <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
              Sourcing without a calendar block is sourcing that won&apos;t happen.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={openAddTask}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-semibold hover:bg-white/25 transition"
            >
              <Plus className="h-4 w-4" /> Add Task
            </button>
            <button
              onClick={openAddPlan}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-rose-700 text-sm font-semibold hover:scale-105 transition shadow-lg"
            >
              <Plus className="h-4 w-4" /> New Week Plan
            </button>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={overdueTasks.length > 0 ? "border-red-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${overdueTasks.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              Overdue ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.slice(0, 3).map(t => <div key={t.id} className="text-xs"><p className="font-medium text-red-600 truncate">{t.title}</p><p className="text-muted-foreground">{formatDate(t.dueDate)}</p></div>)}
            {overdueTasks.length === 0 && <p className="text-xs text-muted-foreground">No overdue tasks!</p>}
          </CardContent>
        </Card>

        <Card className="border-blue-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Today ({todayTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.slice(0, 3).map(t => <div key={t.id} className="text-xs"><p className="font-medium truncate">{t.title}</p><Badge className={`text-xs ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</Badge></div>)}
            {todayTasks.length === 0 && <p className="text-xs text-muted-foreground">No tasks today! Add some or take a break.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Upcoming ({upcomingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTasks.map(t => <div key={t.id} className="text-xs"><p className="font-medium truncate">{t.title}</p><p className="text-muted-foreground">{formatDate(t.dueDate)}</p></div>)}
            {upcomingTasks.length === 0 && <p className="text-xs text-muted-foreground">No upcoming tasks scheduled.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Current Week Plan */}
      {currentWeek && (
        <Card className="border-blue-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Current Week: {formatDate(currentWeek.weekStartDate)}</CardTitle>
              <Button size="sm" variant="outline" onClick={() => openEditPlan(currentWeek)}>Edit</Button>
            </div>
            {currentWeek.mainFocus && <p className="text-sm text-muted-foreground">Focus: {currentWeek.mainFocus}</p>}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center bg-muted rounded-md p-2"><p className="font-bold text-blue-600">{currentWeek.keepaChartsToPractice}</p><p className="text-xs text-muted-foreground">Keepa Charts</p></div>
              <div className="text-center bg-muted rounded-md p-2"><p className="font-bold text-green-600">{currentWeek.productsToAnalyze}</p><p className="text-xs text-muted-foreground">Products</p></div>
              <div className="text-center bg-muted rounded-md p-2"><p className="font-bold text-purple-600">{currentWeek.competitorsToStudy}</p><p className="text-xs text-muted-foreground">Competitors</p></div>
              <div className="text-center bg-muted rounded-md p-2"><p className="font-bold text-orange-600">{currentWeek.suppliersToResearch}</p><p className="text-xs text-muted-foreground">Suppliers</p></div>
            </div>
            {currentWeek.videosToWatch && <p className="text-xs text-muted-foreground mt-3"><span className="font-medium">Videos to watch:</span> {currentWeek.videosToWatch}</p>}
            {currentWeek.skillsToImprove && <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Skills to improve:</span> {currentWeek.skillsToImprove}</p>}
          </CardContent>
        </Card>
      )}

      {/* All Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No tasks yet. Add daily study tasks to stay on track!
            </div>
          ) : tasks.map(t => <TaskCard key={t.id} task={t} />)}
        </CardContent>
      </Card>

      {/* Past Week Plans */}
      {weeklyPlans.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Weekly Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyPlans.map(p => (
              <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEditPlan(p)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{formatDate(p.weekStartDate)}</p>
                      {p.mainFocus && <p className="text-sm text-muted-foreground line-clamp-1">{p.mainFocus}</p>}
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={e => { e.stopPropagation(); deleteWeeklyPlan(p.id); }}>Delete</Button>
                  </div>
                  {p.reflection && <div className="mt-2 text-xs bg-muted rounded-md p-2"><span className="font-medium">Reflection:</span> {p.reflection}</div>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingPlanId ? "Edit Week Plan" : "New Weekly Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div className="space-y-1"><Label>Week Start Date</Label><Input type="date" value={planForm.weekStartDate} onChange={e => setPlanForm(f => ({ ...f, weekStartDate: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Main Focus This Week</Label><Input value={planForm.mainFocus} onChange={e => setPlanForm(f => ({ ...f, mainFocus: e.target.value }))} placeholder="e.g., Master Keepa advanced chart reading" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Keepa Charts to Practice</Label><Input type="number" value={planForm.keepaChartsToPractice} onChange={e => setPlanForm(f => ({ ...f, keepaChartsToPractice: +e.target.value }))} /></div>
              <div className="space-y-1"><Label>Products to Analyze</Label><Input type="number" value={planForm.productsToAnalyze} onChange={e => setPlanForm(f => ({ ...f, productsToAnalyze: +e.target.value }))} /></div>
              <div className="space-y-1"><Label>Competitors to Study</Label><Input type="number" value={planForm.competitorsToStudy} onChange={e => setPlanForm(f => ({ ...f, competitorsToStudy: +e.target.value }))} /></div>
              <div className="space-y-1"><Label>Suppliers to Research</Label><Input type="number" value={planForm.suppliersToResearch} onChange={e => setPlanForm(f => ({ ...f, suppliersToResearch: +e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Videos to Watch</Label><Textarea value={planForm.videosToWatch} onChange={e => setPlanForm(f => ({ ...f, videosToWatch: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>Notes to Take</Label><Textarea value={planForm.notesToTake} onChange={e => setPlanForm(f => ({ ...f, notesToTake: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>Skills to Improve</Label><Textarea value={planForm.skillsToImprove} onChange={e => setPlanForm(f => ({ ...f, skillsToImprove: e.target.value }))} rows={2} /></div>
            <div className="space-y-1"><Label>End of Week Reflection</Label><Textarea value={planForm.reflection} onChange={e => setPlanForm(f => ({ ...f, reflection: e.target.value }))} placeholder="What did you learn? What will you improve next week?" rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
            {editingPlanId && <Button variant="destructive" onClick={() => { deleteWeeklyPlan(editingPlanId); setPlanDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSavePlan}>Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingTaskId ? "Edit Task" : "New Task"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Task Title *</Label><Input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Category</Label>
                <Select value={taskForm.category} onValueChange={v => setTaskForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TASK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm(f => ({ ...f, priority: v as Priority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Status</Label>
                <Select value={taskForm.status} onValueChange={v => setTaskForm(f => ({ ...f, status: v as TaskStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="todo">Todo</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Notes</Label><Textarea value={taskForm.notes} onChange={e => setTaskForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            {editingTaskId && <Button variant="destructive" onClick={() => { deleteTask(editingTaskId); setTaskDialogOpen(false); }}>Delete</Button>}
            <Button onClick={handleSaveTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
