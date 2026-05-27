"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  PlaySquare, LineChart, Package, FileText, Bot, Flame,
  Sparkles, Trophy, ArrowRight, Play, CheckCircle2, Target,
  TrendingUp, Calendar, Clock, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const videos = useStore((s) => s.videos);
  const notes = useStore((s) => s.notes);
  const keepa = useStore((s) => s.keepaEntries);
  const products = useStore((s) => s.productAnalyses);

  const stats = useMemo(() => {
    const completed = videos.filter((v) => v.status === "completed").length;
    const inProgress = videos.filter((v) => v.status === "watching").length;
    const seedVideos = videos.filter((v) => v.isSeeded && v.dayNumber).sort((a, b) => (a.dayNumber ?? 0) - (b.dayNumber ?? 0));
    const total = seedVideos.length || 1;
    const pct = Math.round((seedVideos.filter((v) => v.status === "completed").length / total) * 100);

    // Streak — consecutive days w/ any video activity
    const dates = new Set(
      videos
        .filter((v) => v.dateWatched)
        .map((v) => new Date(v.dateWatched).toDateString()),
    );
    let streak = 0;
    const cursor = new Date();
    while (dates.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Today's next-up
    const nextUp = seedVideos.find((v) => v.status !== "completed") ?? null;
    const currentDay = nextUp?.dayNumber ?? completed + 1;
    const currentWeek = nextUp?.weekNumber ?? Math.ceil(currentDay / 7);

    // Watched this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const watchedThisWeek = videos.filter((v) => {
      if (!v.dateWatched) return false;
      return new Date(v.dateWatched) > oneWeekAgo;
    }).length;

    return {
      completed, inProgress, total, pct, streak, nextUp,
      currentDay, currentWeek, watchedThisWeek,
      totalNotes: notes.length,
      totalKeepa: keepa.length,
      totalProducts: products.length,
    };
  }, [videos, notes, keepa, products]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return "Burning the midnight oil";
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden rounded-3xl p-6 lg:p-10 animate-in">
        <div className="absolute inset-0 brand-gradient opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center text-white">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-widest uppercase opacity-90">
                {greeting} · Day {stats.currentDay} of 30
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black leading-tight mb-3">
              {stats.completed === 0 ? (
                <>Let&apos;s start your <br className="hidden sm:block" /> FBA journey.</>
              ) : stats.completed >= 30 ? (
                <>You finished the curriculum.<br className="hidden sm:block" /> Now go source.</>
              ) : (
                <>You&apos;re {stats.pct}% of the way <br className="hidden sm:block" /> to ready-to-sell.</>
              )}
            </h1>
            <p className="text-white/85 max-w-xl text-sm lg:text-base">
              {stats.nextUp
                ? `Up next: "${stats.nextUp.title}" — ${stats.nextUp.whatItTeaches || "Continue your curriculum."}`
                : "Pick any topic from the Library to dive deeper."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {stats.nextUp ? (
                <Link
                  href={`/watch/${stats.nextUp.id}`}
                  className="inline-flex items-center gap-2 bg-white text-violet-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 active:scale-95 transition shadow-lg"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Continue Day {stats.currentDay}
                </Link>
              ) : (
                <Link
                  href="/videos"
                  className="inline-flex items-center gap-2 bg-white text-violet-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition shadow-lg"
                >
                  <PlaySquare className="h-4 w-4" />
                  Browse Library
                </Link>
              )}
              <Link
                href="/ai-coach"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/15 transition"
              >
                <Bot className="h-4 w-4" />
                Ask Coach
              </Link>
            </div>
          </div>

          {/* Big progress ring */}
          <div className="flex items-center justify-center">
            <ProgressRing value={stats.pct} />
          </div>
        </div>
      </section>

      {/* ─── KPI ROW ─── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Streak"
          value={stats.streak}
          unit={stats.streak === 1 ? "day" : "days"}
          icon={Flame}
          accent="from-orange-400 to-red-500"
          sub={stats.streak >= 3 ? "On fire!" : "Watch today to build it"}
        />
        <Kpi
          label="This week"
          value={stats.watchedThisWeek}
          unit="videos"
          icon={Calendar}
          accent="from-violet-400 to-fuchsia-500"
          sub={stats.watchedThisWeek >= 5 ? "Crushing it" : "Aim for 5+"}
        />
        <Kpi
          label="Keepa charts"
          value={stats.totalKeepa}
          unit="logged"
          icon={LineChart}
          accent="from-indigo-400 to-blue-500"
          sub="Practice = mastery"
        />
        <Kpi
          label="Deals analyzed"
          value={stats.totalProducts}
          unit="products"
          icon={Package}
          accent="from-cyan-400 to-teal-500"
          sub="Each one trains intuition"
        />
      </section>

      {/* ─── TWO-COLUMN MAIN ─── */}
      <section className="grid lg:grid-cols-3 gap-6">
        {/* Up Next card — spans 2 cols */}
        <div className="lg:col-span-2 card-soft p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              What to do today
            </h2>
            <Link href="/videos" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.nextUp ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent border border-violet-500/20">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] tracking-widest uppercase text-violet-600 dark:text-violet-300 font-bold">
                        Day {stats.nextUp.dayNumber} · Week {stats.nextUp.weekNumber}
                      </span>
                      {stats.nextUp.tags?.includes("critical") && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white">
                          ★ CRITICAL
                        </span>
                      )}
                      {stats.nextUp.tags?.includes("core") && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                          CORE
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold leading-snug">{stats.nextUp.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{stats.nextUp.channel}</p>
                  </div>
                  <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-200 font-medium capitalize">
                    {stats.nextUp.difficulty}
                  </span>
                </div>

                {stats.nextUp.whyIncluded && (
                  <p className="text-sm text-foreground/80 mt-3 leading-relaxed">
                    {stats.nextUp.whyIncluded}
                  </p>
                )}

                {stats.nextUp.practiceTask && (
                  <div className="mt-4 p-3 rounded-xl bg-background/60 border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Today&apos;s task
                    </div>
                    <p className="text-sm">{stats.nextUp.practiceTask}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/watch/${stats.nextUp.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold hover:opacity-90 transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Watch + take notes
                  </Link>
                  <Link
                    href="/videos"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-semibold hover:bg-muted/70 transition"
                  >
                    Open in Library
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-500/10 border border-amber-400/30">
              <Trophy className="h-12 w-12 mx-auto text-amber-500 mb-3" />
              <h3 className="text-xl font-bold mb-1">You finished the curriculum!</h3>
              <p className="text-sm text-muted-foreground">
                Move into bonus content or start sourcing real deals.
              </p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card-soft p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              Quick Practice
            </h3>
            <div className="space-y-2">
              <QuickAction
                href="/keepa"
                title="Log a Keepa chart"
                desc="Train your chart-reading muscle"
                icon={LineChart}
                hue="from-indigo-400 to-blue-600"
              />
              <QuickAction
                href="/products"
                title="Analyze a product"
                desc="Run the deal calculator"
                icon={Package}
                hue="from-cyan-400 to-teal-500"
              />
              <QuickAction
                href="/notes"
                title="Capture an insight"
                desc="Don't let it slip away"
                icon={FileText}
                hue="from-amber-400 to-orange-500"
              />
              <QuickAction
                href="/ai-coach"
                title="Ask the AI Coach"
                desc="Stuck on something?"
                icon={Bot}
                hue="from-fuchsia-400 to-pink-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CURRICULUM SNAPSHOT ─── */}
      <section className="card-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-500" />
              30-Day Curriculum
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.completed} of {Math.min(stats.total, 30)} days complete
            </p>
          </div>
          <Link
            href="/videos"
            className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition flex items-center gap-1"
          >
            Open Library <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-30 gap-1.5">
          {Array.from({ length: 30 }).map((_, i) => {
            const day = i + 1;
            const video = videos.find((v) => v.isSeeded && v.dayNumber === day);
            const status = video?.status ?? "not_started";
            const isCurrent = day === stats.currentDay;
            return (
              <div
                key={day}
                title={video ? `Day ${day}: ${video.title} — ${status}` : `Day ${day}`}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition relative",
                  status === "completed" && "bg-gradient-to-br from-emerald-400 to-green-600 text-white",
                  status === "watching" && "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
                  status === "rewatch" && "bg-gradient-to-br from-rose-400 to-pink-600 text-white",
                  status === "skipped" && "bg-muted text-muted-foreground opacity-40",
                  status === "not_started" && !isCurrent && "bg-muted text-muted-foreground",
                  isCurrent && status === "not_started" && "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white ring-2 ring-violet-300 ring-offset-2 ring-offset-card",
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
          <LegendDot color="from-emerald-400 to-green-600" label="Done" />
          <LegendDot color="from-amber-400 to-orange-500" label="Watching" />
          <LegendDot color="from-violet-500 to-fuchsia-600" label="Up next" />
          <LegendDot color="from-rose-400 to-pink-600" label="Rewatch" />
        </div>
      </section>

      {/* ─── ACTIVITY ─── */}
      <section className="grid lg:grid-cols-2 gap-6">
        <RecentActivity videos={videos} notes={notes} keepa={keepa} products={products} />

        <div className="card-soft p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-cyan-500" />
            Skill Pulse
          </h2>
          <div className="space-y-4">
            <SkillBar
              label="Keepa fluency"
              value={Math.min(100, stats.totalKeepa * 5)}
              hue="from-indigo-400 to-blue-600"
              hint={`${stats.totalKeepa} charts practiced`}
            />
            <SkillBar
              label="Deal analysis"
              value={Math.min(100, stats.totalProducts * 4)}
              hue="from-cyan-400 to-teal-500"
              hint={`${stats.totalProducts} products analyzed`}
            />
            <SkillBar
              label="Curriculum coverage"
              value={stats.pct}
              hue="from-violet-400 to-fuchsia-600"
              hint={`${stats.completed} videos completed`}
            />
            <SkillBar
              label="Note-taking"
              value={Math.min(100, stats.totalNotes * 8)}
              hue="from-amber-400 to-orange-500"
              hint={`${stats.totalNotes} notes captured`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function ProgressRing({ value }: { value: number }) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg width={140} height={140} className="-rotate-90">
        <circle
          cx={70} cy={70} r={r}
          stroke="rgba(255,255,255,0.2)" strokeWidth={10} fill="none"
        />
        <circle
          cx={70} cy={70} r={r}
          stroke="white" strokeWidth={10} fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-black">{value}%</div>
        <div className="text-[10px] uppercase tracking-widest opacity-90">complete</div>
      </div>
    </div>
  );
}

function Kpi({
  label, value, unit, icon: Icon, accent, sub,
}: {
  label: string; value: number; unit: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; sub: string;
}) {
  return (
    <div className="card-soft p-5 hover-lift relative overflow-hidden">
      <div className={cn("absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl", accent)} />
      <div className="flex items-start justify-between mb-3 relative">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm", accent)}>
          <Icon className="h-4 w-4 text-white" />
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function QuickAction({
  href, title, desc, icon: Icon, hue,
}: {
  href: string; title: string; desc: string;
  icon: React.ComponentType<{ className?: string }>;
  hue: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/70 transition group"
    >
      <span className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition", hue)}>
        <Icon className="h-4 w-4 text-white" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{desc}</div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
    </Link>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("w-3 h-3 rounded-sm bg-gradient-to-br", color)} />
      <span>{label}</span>
    </div>
  );
}

function SkillBar({
  label, value, hue, hint,
}: { label: string; value: number; hue: string; hint: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full bg-gradient-to-r transition-all duration-700", hue)}
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}

function RecentActivity({
  videos, notes, keepa, products,
}: {
  videos: ReturnType<typeof useStore.getState>["videos"];
  notes: ReturnType<typeof useStore.getState>["notes"];
  keepa: ReturnType<typeof useStore.getState>["keepaEntries"];
  products: ReturnType<typeof useStore.getState>["productAnalyses"];
}) {
  type Activity = {
    id: string;
    type: "video" | "note" | "keepa" | "product";
    title: string;
    when: string;
    icon: React.ComponentType<{ className?: string }>;
    hue: string;
  };

  const items: Activity[] = useMemo(() => {
    const all: Activity[] = [
      ...videos
        .filter((v) => v.dateWatched)
        .map((v) => ({
          id: `v-${v.id}`,
          type: "video" as const,
          title: `Watched: ${v.title}`,
          when: v.dateWatched,
          icon: PlaySquare,
          hue: "from-violet-400 to-purple-600",
        })),
      ...notes.map((n) => ({
        id: `n-${n.id}`,
        type: "note" as const,
        title: `Note: ${n.title || "Untitled"}`,
        when: n.createdAt,
        icon: FileText,
        hue: "from-amber-400 to-orange-500",
      })),
      ...keepa.map((k) => ({
        id: `k-${k.id}`,
        type: "keepa" as const,
        title: `Keepa: ${k.productName || k.asin || "Chart logged"}`,
        when: k.createdAt,
        icon: LineChart,
        hue: "from-indigo-400 to-blue-600",
      })),
      ...products.map((p) => ({
        id: `p-${p.id}`,
        type: "product" as const,
        title: `Deal: ${p.productTitle || "Product"}`,
        when: p.createdAt,
        icon: Package,
        hue: "from-cyan-400 to-teal-500",
      })),
    ];
    return all
      .filter((a) => a.when)
      .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
      .slice(0, 6);
  }, [videos, notes, keepa, products]);

  return (
    <div className="card-soft p-6">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-fuchsia-500" />
        Recent Activity
      </h2>
      {items.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">
          Nothing yet. Watch a video to start your log.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition">
              <span className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0", item.hue)}>
                <item.icon className="h-4 w-4 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(item.when).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 opacity-60" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
