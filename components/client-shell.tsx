"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Sparkles, Flame } from "lucide-react";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useStore } from "@/lib/store";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const { initializeData, initialized, videos } = useStore();

  useEffect(() => {
    if (!initialized) initializeData();
  }, [initialized, initializeData]);

  const watchedToday = videos.filter((v) => {
    if (!v.dateWatched) return false;
    const d = new Date(v.dateWatched);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border shrink-0 glass z-10">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <Link href="/" className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg brand-gradient flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold brand-gradient-text">FBA Mastery</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {watchedToday > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-400/15 to-pink-500/15 border border-orange-400/30">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                  {watchedToday} today
                </span>
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
