"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, PlaySquare, FileText, LineChart, Package,
  Bot, Settings, X, Menu, Sparkles, Flame, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

// Ruthlessly simplified nav. The pages that actually help learning, in priority order.
const primaryNav = [
  { href: "/", label: "Home", icon: Home, hue: "from-pink-400 to-rose-500" },
  { href: "/videos", label: "Library", icon: PlaySquare, hue: "from-violet-400 to-purple-600" },
  { href: "/keepa", label: "Keepa Lab", icon: LineChart, hue: "from-indigo-400 to-blue-600" },
  { href: "/products", label: "Deal Analyzer", icon: Package, hue: "from-cyan-400 to-teal-500" },
  { href: "/notes", label: "Notes", icon: FileText, hue: "from-amber-400 to-orange-500" },
  { href: "/ai-coach", label: "AI Coach", icon: Bot, hue: "from-fuchsia-400 to-pink-600" },
];

const secondaryNav = [
  { href: "/skills", label: "Skills", icon: Target },
  { href: "/planner", label: "Planner", icon: Flame },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const videos = useStore((s) => s.videos);
  const completed = videos.filter((v) => v.status === "completed").length;
  const total = videos.length || 1;
  const pct = Math.round((completed / total) * 100);

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 relative overflow-hidden",
        mobile ? "w-72 h-full" : "w-64",
      )}
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-20 -left-10 w-60 h-60 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 blur-3xl" />
      </div>

      {/* Brand */}
      <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="relative">
            <div className="absolute inset-0 brand-gradient blur-md opacity-70 group-hover:opacity-100 transition" />
            <div className="relative w-9 h-9 rounded-xl brand-gradient flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-base brand-gradient-text">FBA Mastery</div>
            <div className="text-[10px] tracking-widest uppercase text-sidebar-foreground/50">Learning OS</div>
          </div>
        </Link>
        {mobile && (
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Progress chip */}
      <div className="relative mx-5 mt-2 mb-4 p-3 rounded-xl glass border border-white/10">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-sidebar-foreground/70">Curriculum</span>
          <span className="text-xs font-bold text-sidebar-foreground">{completed}/{total}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full brand-gradient transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] text-sidebar-foreground/50 mt-1.5">
          {pct}% complete · {30 - completed > 0 ? `${30 - completed} days to go` : "Curriculum done"}
        </div>
      </div>

      {/* Primary nav */}
      <nav className="relative flex-1 overflow-y-auto px-3 space-y-0.5">
        <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-1.5">Main</div>
        {primaryNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative",
                isActive
                  ? "bg-white/10 text-sidebar-foreground"
                  : "text-sidebar-foreground/65 hover:bg-white/5 hover:text-sidebar-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition",
                  isActive
                    ? `bg-gradient-to-br ${item.hue} shadow-lg`
                    : "bg-white/5 group-hover:bg-white/10",
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && "text-white")} />
              </span>
              <span className="truncate font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full brand-gradient" />
              )}
            </Link>
          );
        })}

        <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 px-3 mt-5 mb-1.5">More</div>
        {secondaryNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-sidebar-foreground"
                  : "text-sidebar-foreground/55 hover:bg-white/5 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative px-5 py-4 border-t border-white/10">
        <div className="text-[10px] text-sidebar-foreground/40 text-center">
          Built for sellers who actually do the work.
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-md text-foreground hover:bg-accent transition"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 animate-in">
            <Sidebar mobile onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
