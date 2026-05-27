export type SkillStatus = "not_started" | "learning" | "practicing" | "mastered";
export type VideoStatus = "not_started" | "watching" | "completed" | "rewatch" | "skipped" | "archived";
export type VideoDifficulty = "beginner" | "intermediate" | "advanced";
export type VideoSourceType =
  | "YouTube Video"
  | "YouTube Playlist"
  | "YouTube Channel"
  | "Official Tool Page"
  | "Official Amazon Training"
  | "Official Amazon Help"
  | "Article"
  | "Practice Day";
export type ProductDecision = "reject" | "watchlist" | "manual_review" | "buy_test" | "reorder_later";
export type KeepaDecision = "good_buy" | "bad_buy" | "manual_review" | "too_risky" | "oversaturated" | "amazon_dominated" | "price_unstable" | "seasonal" | "not_enough_demand" | "need_more_data";
export type RiskLevel = "low" | "medium" | "high";
export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "completed";
export type SupplierStatus = "new" | "researching" | "contacted" | "price_sheet_received" | "approved" | "rejected";
export type SellerType = "wholesale" | "online_arbitrage" | "retail_arbitrage" | "private_label" | "mixed" | "mega" | "not_useful";

export interface VideoDailyChecklist {
  watchedVideo: boolean;
  tookNotes: boolean;
  addedTakeaways: boolean;
  completedPracticeTask: boolean;
  addedConfidence: boolean;
  markedRewatch: boolean;
}

export interface Video {
  id: string;
  title: string;
  link: string;
  channel: string;
  category: string;
  difficulty: VideoDifficulty;
  status: VideoStatus;
  rating: number;
  keyTakeaways: string;
  timestampNotes: string;
  actionItems: string;
  relatedSkill: string;
  dateWatched: string;
  needRewatch: boolean;
  tags: string[];
  isSeeded?: boolean;
  createdAt: string;
  // v2 extended fields
  sourceType?: VideoSourceType;
  dayNumber?: number;
  weekNumber?: number;
  whyIncluded?: string;
  whatItTeaches?: string;
  practiceTask?: string;
  isBonus?: boolean;
  confidenceScore?: number;
  mainIdea?: string;
  rulesLearned?: string;
  mistakesToAvoid?: string;
  practiceCompleted?: boolean;
  needsAIReview?: boolean;
  aiDescription?: string;
  dailyChecklist?: VideoDailyChecklist;
}

export interface Note {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  date: string;
  mainIdea: string;
  detailedNotes: string;
  keyLesson: string;
  mistakesToAvoid: string;
  actionSteps: string;
  relatedVideoId: string;
  relatedProductId: string;
  tags: string[];
  confidenceScore: number;
  needReview: boolean;
  createdAt: string;
}

export interface KeepaEntry {
  id: string;
  productName: string;
  asin: string;
  amazonLink: string;
  category: string;
  screenshotUrl: string;
  currentBuyBox: number;
  avg30DayPrice: number;
  avg90DayPrice: number;
  avg180DayPrice: number;
  salesRank: number;
  salesRankDrops: number;
  offerCount: number;
  fbaSellerCount: number;
  amazonInStockPercent: number;
  reviewCount: number;
  rating: number;
  myAnalysis: string;
  myDecision: KeepaDecision;
  correctDecision: KeepaDecision;
  whatIMissed: string;
  lessonLearned: string;
  confidenceScore: number;
  checklist: Record<string, boolean>;
  mistakes: string[];
  createdAt: string;
}

export interface ProductAnalysis {
  id: string;
  productTitle: string;
  asin: string;
  upc: string;
  category: string;
  brand: string;
  supplierSource: string;
  buyCost: number;
  amazonPrice: number;
  avg30DayPrice: number;
  avg90DayPrice: number;
  fbaFee: number;
  referralFee: number;
  inboundShipping: number;
  prepCost: number;
  netProfit: number;
  roi: number;
  profitMargin: number;
  breakEvenPrice: number;
  minimumSafePrice: number;
  estimatedMonthlySales: number;
  fbaSellerCount: number;
  totalOfferCount: number;
  amazonPresence: string;
  offerCountTrend: string;
  riskLevel: RiskLevel;
  oversaturationLevel: string;
  matchConfidence: string;
  myDecision: ProductDecision;
  aiNotes: string;
  whatILearned: string;
  score: number;
  testQuantity: number;
  createdAt: string;
}

export interface Competitor {
  id: string;
  sellerName: string;
  storefrontLink: string;
  marketplace: string;
  mainCategories: string[];
  brandsSold: string[];
  productTypes: string[];
  sellerType: SellerType;
  productsWorthStudying: string;
  repeatedBrands: string;
  supplierClues: string;
  notes: string;
  dateChecked: string;
  followUpTask: string;
  status: string;
  createdAt: string;
}

export interface Brand {
  id: string;
  brandName: string;
  category: string;
  productsFound: string;
  competitorsSelling: string;
  amazonPresence: string;
  riskLevel: RiskLevel;
  supplierFound: boolean;
  wholesalePotential: string;
  notes: string;
  status: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierName: string;
  website: string;
  supplierType: string;
  contactPage: string;
  wholesalePage: string;
  moq: string;
  brandsCarried: string;
  productsFound: string;
  notes: string;
  contactStatus: SupplierStatus;
  createdAt: string;
}

export interface Skill {
  id: string;
  skillName: string;
  category: string;
  status: SkillStatus;
  confidenceScore: number;
  notes: string;
  updatedAt: string;
}

export interface WeeklyPlan {
  id: string;
  weekStartDate: string;
  mainFocus: string;
  videosToWatch: string;
  notesToTake: string;
  keepaChartsToPractice: number;
  productsToAnalyze: number;
  competitorsToStudy: number;
  suppliersToResearch: number;
  skillsToImprove: string;
  reflection: string;
  tasks: Task[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  status: TaskStatus;
  priority: Priority;
  notes: string;
  weeklyPlanId?: string;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: VideoDifficulty;
  status: "new" | "learning" | "known";
  lastReviewed: string;
  confidenceScore: number;
  isSeeded?: boolean;
  createdAt: string;
}

export interface RoadmapLesson {
  id: string;
  levelId: string;
  title: string;
  status: SkillStatus;
  notes: string;
  videos: string[];
  practiceTasks: string;
  quizQuestions: string;
  confidenceScore: number;
}

export interface RoadmapLevel {
  id: string;
  title: string;
  description: string;
  lessons: RoadmapLesson[];
}

export interface Settings {
  minProfit: number;
  minROI: number;
  preferredROI: number;
  maxFBASellers: number;
  testBuyQuantityMin: number;
  testBuyQuantityMax: number;
  targetSellThroughMin: number;
  targetSellThroughMax: number;
  targetCategories: string[];
  avoidCategories: string[];
  weeklyStudyGoal: number;
  preferredLearningGoals: string;
}

export interface DashboardStats {
  totalVideos: number;
  videosCompleted: number;
  videosInProgress: number;
  totalNotes: number;
  keepaPracticeCount: number;
  productAnalysisCount: number;
  competitorsStudied: number;
  suppliersStudied: number;
  weeklyStreak: number;
  skillLevel: string;
  strongestSkill: string;
  weakestSkill: string;
}
