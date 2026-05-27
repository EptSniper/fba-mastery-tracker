"use client";
import React, { useEffect } from "react";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useStore } from "@/lib/store";
import { Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { initializeData, initialized } = useStore();

  useEffect(() => {
    if (!initialized) {
      initializeData();
    }
  }, [initialized, initializeData]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <MobileSidebar />
            <div>
              <h1 className="text-lg font-semibold text-foreground lg:hidden">FBA Mastery</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
