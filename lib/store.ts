"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Video, Note, KeepaEntry, ProductAnalysis, Competitor, Brand,
  Supplier, Skill, WeeklyPlan, Task, Flashcard, Settings, RoadmapLesson
} from "@/types";
import { generateId } from "@/lib/utils";
import { SEED_VIDEOS } from "@/lib/data/seed-videos";
import { SEED_FLASHCARDS } from "@/lib/data/flashcards";
import { SEED_SKILLS } from "@/lib/data/skills-data";

interface AppState {
  // Data
  videos: Video[];
  notes: Note[];
  keepaEntries: KeepaEntry[];
  productAnalyses: ProductAnalysis[];
  competitors: Competitor[];
  brands: Brand[];
  suppliers: Supplier[];
  skills: Skill[];
  weeklyPlans: WeeklyPlan[];
  tasks: Task[];
  flashcards: Flashcard[];
  roadmapProgress: Record<string, RoadmapLesson>;
  settings: Settings;
  initialized: boolean;

  // Actions - Videos
  addVideo: (video: Omit<Video, "id" | "createdAt">) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  deleteVideo: (id: string) => void;

  // Actions - Notes
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Actions - Keepa
  addKeepaEntry: (entry: Omit<KeepaEntry, "id" | "createdAt">) => void;
  updateKeepaEntry: (id: string, updates: Partial<KeepaEntry>) => void;
  deleteKeepaEntry: (id: string) => void;

  // Actions - Products
  addProductAnalysis: (product: Omit<ProductAnalysis, "id" | "createdAt">) => void;
  updateProductAnalysis: (id: string, updates: Partial<ProductAnalysis>) => void;
  deleteProductAnalysis: (id: string) => void;

  // Actions - Competitors
  addCompetitor: (competitor: Omit<Competitor, "id" | "createdAt">) => void;
  updateCompetitor: (id: string, updates: Partial<Competitor>) => void;
  deleteCompetitor: (id: string) => void;

  // Actions - Brands
  addBrand: (brand: Omit<Brand, "id" | "createdAt">) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;

  // Actions - Suppliers
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Actions - Skills
  updateSkill: (id: string, updates: Partial<Skill>) => void;

  // Actions - Weekly Plans
  addWeeklyPlan: (plan: Omit<WeeklyPlan, "id" | "createdAt">) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
  deleteWeeklyPlan: (id: string) => void;

  // Actions - Tasks
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Actions - Flashcards
  addFlashcard: (card: Omit<Flashcard, "id" | "createdAt">) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;

  // Actions - Roadmap
  updateRoadmapLesson: (lessonId: string, updates: Partial<RoadmapLesson>) => void;

  // Actions - Settings
  updateSettings: (updates: Partial<Settings>) => void;

  // Init
  initializeData: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  minProfit: 5,
  minROI: 30,
  preferredROI: 35,
  maxFBASellers: 15,
  testBuyQuantityMin: 5,
  testBuyQuantityMax: 20,
  targetSellThroughMin: 30,
  targetSellThroughMax: 75,
  targetCategories: ["Office Products", "Arts & Crafts", "Tools", "Pet Supplies", "Shipping Supplies", "Storage", "Kitchen"],
  avoidCategories: ["Supplements", "Beauty", "Electronics", "Baby", "Food", "Medical"],
  weeklyStudyGoal: 10,
  preferredLearningGoals: "Master Keepa chart reading and product research",
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      videos: [],
      notes: [],
      keepaEntries: [],
      productAnalyses: [],
      competitors: [],
      brands: [],
      suppliers: [],
      skills: [],
      weeklyPlans: [],
      tasks: [],
      flashcards: [],
      roadmapProgress: {},
      settings: DEFAULT_SETTINGS,
      initialized: false,

      initializeData: () => {
        const state = get();
        // v5 marker: every seeded video now ships with a pre-written aiDescription.
        // If Day 1's seeded video doesn't have aiDescription, we're on an older seed.
        const hasV5Seed = state.videos.some(
          (v) => v.isSeeded && v.dayNumber === 1 && typeof v.aiDescription === "string" && v.aiDescription.length > 100,
        );
        const userVideos = state.videos.filter((v) => !v.isSeeded);
        if (!hasV5Seed) {
          set({
            videos: [...SEED_VIDEOS, ...userVideos],
            flashcards: state.flashcards.length > 0 ? state.flashcards : SEED_FLASHCARDS,
            skills: state.skills.length > 0 ? state.skills : SEED_SKILLS,
            initialized: true,
          });
          return;
        }
        if (!state.initialized) {
          set({
            flashcards: state.flashcards.length > 0 ? state.flashcards : SEED_FLASHCARDS,
            skills: state.skills.length > 0 ? state.skills : SEED_SKILLS,
            initialized: true,
          });
        }
      },

      addVideo: (video) => set((s) => ({
        videos: [{ ...video, id: generateId(), createdAt: new Date().toISOString() }, ...s.videos],
      })),
      updateVideo: (id, updates) => set((s) => ({
        videos: s.videos.map((v) => v.id === id ? { ...v, ...updates } : v),
      })),
      deleteVideo: (id) => set((s) => ({
        videos: s.videos.filter((v) => v.id !== id),
      })),

      addNote: (note) => set((s) => ({
        notes: [{ ...note, id: generateId(), createdAt: new Date().toISOString() }, ...s.notes],
      })),
      updateNote: (id, updates) => set((s) => ({
        notes: s.notes.map((n) => n.id === id ? { ...n, ...updates } : n),
      })),
      deleteNote: (id) => set((s) => ({
        notes: s.notes.filter((n) => n.id !== id),
      })),

      addKeepaEntry: (entry) => set((s) => ({
        keepaEntries: [{ ...entry, id: generateId(), createdAt: new Date().toISOString() }, ...s.keepaEntries],
      })),
      updateKeepaEntry: (id, updates) => set((s) => ({
        keepaEntries: s.keepaEntries.map((e) => e.id === id ? { ...e, ...updates } : e),
      })),
      deleteKeepaEntry: (id) => set((s) => ({
        keepaEntries: s.keepaEntries.filter((e) => e.id !== id),
      })),

      addProductAnalysis: (product) => set((s) => ({
        productAnalyses: [{ ...product, id: generateId(), createdAt: new Date().toISOString() }, ...s.productAnalyses],
      })),
      updateProductAnalysis: (id, updates) => set((s) => ({
        productAnalyses: s.productAnalyses.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),
      deleteProductAnalysis: (id) => set((s) => ({
        productAnalyses: s.productAnalyses.filter((p) => p.id !== id),
      })),

      addCompetitor: (competitor) => set((s) => ({
        competitors: [{ ...competitor, id: generateId(), createdAt: new Date().toISOString() }, ...s.competitors],
      })),
      updateCompetitor: (id, updates) => set((s) => ({
        competitors: s.competitors.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      deleteCompetitor: (id) => set((s) => ({
        competitors: s.competitors.filter((c) => c.id !== id),
      })),

      addBrand: (brand) => set((s) => ({
        brands: [{ ...brand, id: generateId(), createdAt: new Date().toISOString() }, ...s.brands],
      })),
      updateBrand: (id, updates) => set((s) => ({
        brands: s.brands.map((b) => b.id === id ? { ...b, ...updates } : b),
      })),
      deleteBrand: (id) => set((s) => ({
        brands: s.brands.filter((b) => b.id !== id),
      })),

      addSupplier: (supplier) => set((s) => ({
        suppliers: [{ ...supplier, id: generateId(), createdAt: new Date().toISOString() }, ...s.suppliers],
      })),
      updateSupplier: (id, updates) => set((s) => ({
        suppliers: s.suppliers.map((s2) => s2.id === id ? { ...s2, ...updates } : s2),
      })),
      deleteSupplier: (id) => set((s) => ({
        suppliers: s.suppliers.filter((s2) => s2.id !== id),
      })),

      updateSkill: (id, updates) => set((s) => ({
        skills: s.skills.map((sk) => sk.id === id ? { ...sk, ...updates, updatedAt: new Date().toISOString() } : sk),
      })),

      addWeeklyPlan: (plan) => set((s) => ({
        weeklyPlans: [{ ...plan, id: generateId(), createdAt: new Date().toISOString() }, ...s.weeklyPlans],
      })),
      updateWeeklyPlan: (id, updates) => set((s) => ({
        weeklyPlans: s.weeklyPlans.map((p) => p.id === id ? { ...p, ...updates } : p),
      })),
      deleteWeeklyPlan: (id) => set((s) => ({
        weeklyPlans: s.weeklyPlans.filter((p) => p.id !== id),
      })),

      addTask: (task) => set((s) => ({
        tasks: [{ ...task, id: generateId(), createdAt: new Date().toISOString() }, ...s.tasks],
      })),
      updateTask: (id, updates) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      deleteTask: (id) => set((s) => ({
        tasks: s.tasks.filter((t) => t.id !== id),
      })),

      addFlashcard: (card) => set((s) => ({
        flashcards: [{ ...card, id: generateId(), createdAt: new Date().toISOString() }, ...s.flashcards],
      })),
      updateFlashcard: (id, updates) => set((s) => ({
        flashcards: s.flashcards.map((f) => f.id === id ? { ...f, ...updates } : f),
      })),
      deleteFlashcard: (id) => set((s) => ({
        flashcards: s.flashcards.filter((f) => f.id !== id),
      })),

      updateRoadmapLesson: (lessonId, updates) => set((s) => ({
        roadmapProgress: {
          ...s.roadmapProgress,
          [lessonId]: { ...s.roadmapProgress[lessonId], ...updates },
        },
      })),

      updateSettings: (updates) => set((s) => ({
        settings: { ...s.settings, ...updates },
      })),
    }),
    {
      name: "fba-mastery-tracker",
      version: 1,
    }
  )
);
