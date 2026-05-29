/**
 * Research-backed Amazon arbitrage product scoring.
 *
 * Encodes the criteria that experienced OA/RA sellers and the major tools use to
 * decide if a product is a GOOD, low-risk, profitable buy. Sources synthesized:
 *  - SellerAmp "O.A. Risk Matrix" (IP Safety → Listing Health → Profit Velocity →
 *    Supply Depth → Buy Box Health)
 *  - Seller Assistant "How to find profitable products" (ROI 30%+, $5+ profit,
 *    3–15 FBA sellers, top 1% BSR, 4★+ reviews)
 *  - ClearTheShelf / TheSellingGuys category BSR percentile charts
 *  - GoAura / JungleScout arbitrage guides (sales-per-seller, buy-box share)
 *
 * The model is a transparent 100-point weighted score split across 5 pillars,
 * plus hard "gate" red flags that can override the band. Everything is a guide,
 * not gospel — BSR % depends on category size, and the seller's own criteria win.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BSR category reference — approximate "top tier" sales-rank thresholds.
// Structured like the published percentile charts (top5 ≈ 5× top1, top10 ≈ 10×).
// A product at/under top1 sells in roughly the best 1% of its category = fast mover.
// ─────────────────────────────────────────────────────────────────────────────
export interface BsrTier {
  top1: number;
  top5: number;
  top10: number;
}

export const BSR_CATEGORY_TABLE: Record<string, BsrTier> = {
  "Toys & Games": { top1: 100_000, top5: 500_000, top10: 1_000_000 },
  "Home & Kitchen": { top1: 300_000, top5: 1_500_000, top10: 3_000_000 },
  "Grocery & Gourmet Food": { top1: 40_000, top5: 200_000, top10: 400_000 },
  "Beauty & Personal Care": { top1: 150_000, top5: 750_000, top10: 1_500_000 },
  "Health & Household": { top1: 150_000, top5: 750_000, top10: 1_500_000 },
  "Office Products": { top1: 125_000, top5: 625_000, top10: 1_250_000 },
  "Pet Supplies": { top1: 90_000, top5: 450_000, top10: 900_000 },
  "Sports & Outdoors": { top1: 400_000, top5: 2_000_000, top10: 4_000_000 },
  "Tools & Home Improvement": { top1: 250_000, top5: 1_250_000, top10: 2_500_000 },
  "Patio, Lawn & Garden": { top1: 150_000, top5: 750_000, top10: 1_500_000 },
  "Electronics": { top1: 150_000, top5: 750_000, top10: 1_500_000 },
  "Baby": { top1: 80_000, top5: 400_000, top10: 800_000 },
  "Arts, Crafts & Sewing": { top1: 120_000, top5: 600_000, top10: 1_200_000 },
  "Industrial & Scientific": { top1: 120_000, top5: 600_000, top10: 1_200_000 },
  "Books": { top1: 250_000, top5: 1_250_000, top10: 2_500_000 },
};

// Fallback for unknown / unmapped categories.
const DEFAULT_BSR_TIER: BsrTier = { top1: 100_000, top5: 500_000, top10: 1_000_000 };

export const BSR_CATEGORY_NAMES = Object.keys(BSR_CATEGORY_TABLE);

/** Loose, case-insensitive match of a free-text category to the BSR table. */
export function resolveBsrTier(category?: string): { tier: BsrTier; matched: string | null } {
  if (!category) return { tier: DEFAULT_BSR_TIER, matched: null };
  const c = category.trim().toLowerCase();
  // exact-ish first
  for (const name of BSR_CATEGORY_NAMES) {
    if (name.toLowerCase() === c) return { tier: BSR_CATEGORY_TABLE[name], matched: name };
  }
  // keyword contains
  for (const name of BSR_CATEGORY_NAMES) {
    const key = name.toLowerCase();
    if (c.includes(key) || key.includes(c)) return { tier: BSR_CATEGORY_TABLE[name], matched: name };
  }
  // single-word heuristics
  const hints: [string, string][] = [
    ["toy", "Toys & Games"], ["kitchen", "Home & Kitchen"], ["home", "Home & Kitchen"],
    ["grocery", "Grocery & Gourmet Food"], ["food", "Grocery & Gourmet Food"],
    ["beauty", "Beauty & Personal Care"], ["health", "Health & Household"],
    ["office", "Office Products"], ["pet", "Pet Supplies"], ["sport", "Sports & Outdoors"],
    ["tool", "Tools & Home Improvement"], ["garden", "Patio, Lawn & Garden"],
    ["electronic", "Electronics"], ["baby", "Baby"], ["craft", "Arts, Crafts & Sewing"],
    ["art", "Arts, Crafts & Sewing"], ["book", "Books"], ["industrial", "Industrial & Scientific"],
  ];
  for (const [hint, name] of hints) {
    if (c.includes(hint)) return { tier: BSR_CATEGORY_TABLE[name], matched: name };
  }
  return { tier: DEFAULT_BSR_TIER, matched: null };
}

export type BsrBucket = "top1" | "top5" | "top10" | "below";

export interface BsrRating {
  bucket: BsrBucket;
  label: string;
  matchedCategory: string | null;
  good: boolean;
}

/** Rate a sales rank against its category percentile tiers. */
export function rateBsr(category: string | undefined, salesRank: number | undefined): BsrRating | null {
  if (!salesRank || salesRank <= 0) return null;
  const { tier, matched } = resolveBsrTier(category);
  let bucket: BsrBucket;
  let label: string;
  if (salesRank <= tier.top1) { bucket = "top1"; label = "Top ~1% (fast mover)"; }
  else if (salesRank <= tier.top5) { bucket = "top5"; label = "Top ~5% (good demand)"; }
  else if (salesRank <= tier.top10) { bucket = "top10"; label = "Top ~10% (okay)"; }
  else { bucket = "below"; label = "Below top 10% (slow)"; }
  return { bucket, label, matchedCategory: matched, good: bucket === "top1" || bucket === "top5" };
}

// ─────────────────────────────────────────────────────────────────────────────
// Demand helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Your expected monthly unit share: total monthly sales split across sellers (+you). */
export function salesPerSeller(monthlySales?: number, fbaSellers?: number): number | null {
  if (!monthlySales || monthlySales <= 0) return null;
  const sellers = Math.max(0, fbaSellers ?? 0);
  return monthlySales / (sellers + 1);
}

export interface SellThrough {
  rate: number;
  label: string;
  good: boolean;
}

/** Sell-through ≈ monthly sales ÷ live offers. >1 means each offer turns over monthly. */
export function sellThrough(monthlySales?: number, offers?: number): SellThrough | null {
  if (!monthlySales || monthlySales <= 0 || !offers || offers <= 0) return null;
  const rate = monthlySales / offers;
  let label = "Low", good = false;
  if (rate >= 2) { label = "Excellent"; good = true; }
  else if (rate >= 1) { label = "Good"; good = true; }
  else if (rate >= 0.5) { label = "Moderate"; good = false; }
  return { rate, label, good };
}

/** Map a Keepa "Amazon in stock %" to the qualitative presence buckets. */
export function presenceFromInStockPct(pct?: number): AmazonPresence {
  if (pct === undefined || pct === null) return "sometimes";
  if (pct <= 0) return "never";
  if (pct < 10) return "rarely";
  if (pct < 50) return "sometimes";
  if (pct < 90) return "often";
  return "dominant";
}

export type AmazonPresence = "never" | "rarely" | "sometimes" | "often" | "dominant";
export type OfferTrend = "declining" | "stable" | "growing_slowly" | "exploding";
export type RiskLevel = "low" | "medium" | "high";

// ─────────────────────────────────────────────────────────────────────────────
// Full deal score (financial + market) — used by the Deal Analyzer
// ─────────────────────────────────────────────────────────────────────────────

export interface DealInput {
  buyCost?: number;
  amazonPrice?: number; // current sell / buy box
  netProfit?: number;
  roi?: number; // percent
  category?: string;
  salesRank?: number;
  estimatedMonthlySales?: number;
  fbaSellerCount?: number;
  totalOfferCount?: number;
  amazonPresence?: string;
  offerCountTrend?: string;
  avg30DayPrice?: number;
  avg90DayPrice?: number;
  riskLevel?: RiskLevel;
  // seller's own thresholds (from settings)
  minROI?: number;
  preferredROI?: number;
  minProfit?: number;
}

export interface SubScore {
  key: string;
  label: string;
  score: number;
  max: number;
  note: string;
}

export type DealBand = "strong_buy" | "buy" | "review" | "watch" | "reject";

export interface DealVerdict {
  total: number;
  band: DealBand;
  bandLabel: string;
  subScores: SubScore[];
  greenFlags: string[];
  redFlags: string[];
  bsr: BsrRating | null;
  salesPerSellerValue: number | null;
  sellThroughValue: SellThrough | null;
  suggestedDecision: string;
}

const BAND_LABELS: Record<DealBand, string> = {
  strong_buy: "Strong Buy",
  buy: "Buy / Test",
  review: "Manual Review",
  watch: "Watchlist",
  reject: "Reject",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function scoreDeal(input: DealInput): DealVerdict {
  const minROI = input.minROI ?? 30;
  const preferredROI = input.preferredROI ?? 50;
  const minProfit = input.minProfit ?? 5;

  const green: string[] = [];
  const red: string[] = [];

  // ── Pillar 1: Profitability (30) ──────────────────────────────────────────
  const roi = input.roi ?? 0;
  const profit = input.netProfit ?? 0;
  let roiPts = 0;
  if (roi >= preferredROI) roiPts = 18;
  else if (roi >= minROI) roiPts = 13;
  else if (roi >= minROI * 0.66) roiPts = 7;
  else if (roi > 0) roiPts = 2;
  let profitPts = 0;
  if (profit >= minProfit * 2) profitPts = 12;
  else if (profit >= minProfit) profitPts = 8;
  else if (profit >= 3) profitPts = 5;
  else if (profit > 0) profitPts = 2;
  const profitScore = roiPts + profitPts;
  if (roi >= preferredROI) green.push(`Strong ROI (${roi.toFixed(0)}%)`);
  if (roi > 0 && roi < minROI) red.push(`ROI ${roi.toFixed(0)}% is below your ${minROI}% minimum`);
  if (profit <= 0) red.push("Not profitable after all fees");
  else if (profit >= minProfit * 2) green.push(`Healthy margin (${profit.toFixed(2)}/unit)`);

  // ── Pillar 2: Sales velocity / demand (25) ──────────────────────────────────
  const bsr = rateBsr(input.category, input.salesRank);
  const sps = salesPerSeller(input.estimatedMonthlySales, input.fbaSellerCount);
  const st = sellThrough(input.estimatedMonthlySales, input.totalOfferCount);
  let velocityBase = 0;
  let velocityNote = "";
  if (bsr) {
    if (bsr.bucket === "top1") { velocityBase = 16; velocityNote = bsr.label; }
    else if (bsr.bucket === "top5") { velocityBase = 12; velocityNote = bsr.label; }
    else if (bsr.bucket === "top10") { velocityBase = 7; velocityNote = bsr.label; }
    else { velocityBase = 2; velocityNote = bsr.label; }
  } else if (input.estimatedMonthlySales !== undefined) {
    const s = input.estimatedMonthlySales;
    if (s >= 300) velocityBase = 16;
    else if (s >= 100) velocityBase = 12;
    else if (s >= 30) velocityBase = 7;
    else if (s >= 10) velocityBase = 4;
    else velocityBase = 1;
    velocityNote = `${s}/mo est. sales`;
  } else {
    velocityBase = 8;
    velocityNote = "No rank/sales data";
  }
  let spsBonus = 0;
  if (sps !== null) {
    if (sps >= 10) spsBonus = 9;
    else if (sps >= 5) spsBonus = 7;
    else if (sps >= 3) spsBonus = 4;
    else if (sps >= 1) spsBonus = 2;
    else spsBonus = 0;
  } else {
    spsBonus = 4; // neutral if not computable
  }
  const velocityScore = clamp(velocityBase + spsBonus, 0, 25);
  if (bsr?.bucket === "top1") green.push("Top ~1% seller for its category");
  if (bsr?.bucket === "below") red.push("Slow seller for its category");
  if (sps !== null && sps >= 5) green.push(`~${sps.toFixed(1)} sales/mo expected for you`);
  if (sps !== null && sps < 1) red.push("Likely under 1 sale/month for you");

  // ── Pillar 3: Competition / supply depth (20) ───────────────────────────────
  const sellers = input.fbaSellerCount;
  let sellerPts = 7; // neutral when unknown
  if (sellers !== undefined) {
    if (sellers <= 0) sellerPts = 0;
    else if (sellers === 1) sellerPts = 3; // possible private label / brand-only
    else if (sellers === 2) sellerPts = 9;
    else if (sellers >= 3 && sellers <= 10) sellerPts = 14;
    else if (sellers <= 15) sellerPts = 9;
    else if (sellers <= 20) sellerPts = 4;
    else sellerPts = 0;
  }
  const trend = input.offerCountTrend as OfferTrend | undefined;
  let trendPts = 3;
  if (trend === "declining") trendPts = 6;
  else if (trend === "stable") trendPts = 5;
  else if (trend === "growing_slowly") trendPts = 2;
  else if (trend === "exploding") trendPts = 0;
  const competitionScore = sellerPts + trendPts;
  if (sellers !== undefined && sellers >= 3 && sellers <= 10) green.push("Competition in the sweet spot (3–10)");
  if (sellers !== undefined && sellers > 20) red.push(`Oversaturated (${sellers} FBA sellers)`);
  if (sellers === 1) red.push("Only 1 seller — check for private label / brand gating");
  if (trend === "exploding") red.push("Offer count exploding — race-to-bottom risk");

  // ── Pillar 4: Amazon competition risk (15) ──────────────────────────────────
  const presence = (input.amazonPresence as AmazonPresence | undefined);
  let amazonScore = 7; // neutral
  if (presence === "never") amazonScore = 15;
  else if (presence === "rarely") amazonScore = 12;
  else if (presence === "sometimes") amazonScore = 6;
  else if (presence === "often") amazonScore = 1;
  else if (presence === "dominant") amazonScore = 0;
  if (presence === "never" || presence === "rarely") green.push("Amazon absent from the buy box");
  if (presence === "often" || presence === "dominant") red.push("Amazon competes on this listing");

  // ── Pillar 5: Price stability / buy box health (10) ─────────────────────────
  const current = input.amazonPrice ?? 0;
  const avg90 = input.avg90DayPrice ?? 0;
  const avg30 = input.avg30DayPrice ?? 0;
  let priceScore = 5; // neutral when missing
  let tanking = false;
  if (current > 0 && avg90 > 0) {
    const ratio = current / avg90;
    if (ratio >= 1.0) priceScore = 10;
    else if (ratio >= 0.95) priceScore = 8;
    else if (ratio >= 0.9) priceScore = 6;
    else if (ratio >= 0.8) priceScore = 3;
    else priceScore = 0;
  }
  if (avg30 > 0 && avg90 > 0 && avg30 < avg90 * 0.92) {
    tanking = true;
    priceScore = Math.min(priceScore, 3);
  }
  if (current > 0 && avg90 > 0 && current >= avg90) green.push("Price at/above 90-day average");
  if (tanking) red.push("Price trending down (30-day below 90-day)");

  const total = Math.round(
    profitScore + velocityScore + competitionScore + amazonScore + priceScore,
  );

  // ── Band + hard gates ───────────────────────────────────────────────────────
  let band: DealBand;
  if (total >= 80) band = "strong_buy";
  else if (total >= 65) band = "buy";
  else if (total >= 48) band = "review";
  else if (total >= 32) band = "watch";
  else band = "reject";

  // Critical overrides — these dominate the math.
  if (profit <= 0) band = "reject";
  if (input.riskLevel === "high") {
    red.push("Flagged high risk (IP / hazmat / gating?)");
    if (band === "strong_buy" || band === "buy") band = "review";
  }
  if (presence === "dominant" && band !== "reject") {
    if (band === "strong_buy" || band === "buy") band = "review";
  }

  const suggestedDecision =
    band === "strong_buy" || band === "buy" ? "buy_test" :
    band === "review" ? "manual_review" :
    band === "watch" ? "watchlist" : "reject";

  const subScores: SubScore[] = [
    { key: "profit", label: "Profitability", score: profitScore, max: 30, note: `ROI ${roi.toFixed(0)}% · ${profit >= 0 ? "$" : "-$"}${Math.abs(profit).toFixed(2)}/unit` },
    { key: "velocity", label: "Sales Velocity", score: velocityScore, max: 25, note: velocityNote },
    { key: "competition", label: "Competition", score: competitionScore, max: 20, note: sellers !== undefined ? `${sellers} FBA · ${trend ?? "trend n/a"}` : "sellers n/a" },
    { key: "amazon", label: "Amazon Risk", score: amazonScore, max: 15, note: presence ? `Amazon ${presence}` : "presence n/a" },
    { key: "price", label: "Buy Box Health", score: priceScore, max: 10, note: tanking ? "tanking" : current > 0 && avg90 > 0 ? `${((current / avg90) * 100).toFixed(0)}% of 90d avg` : "price n/a" },
  ];

  return {
    total,
    band,
    bandLabel: BAND_LABELS[band],
    subScores,
    greenFlags: green,
    redFlags: red,
    bsr,
    salesPerSellerValue: sps,
    sellThroughValue: st,
    suggestedDecision,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Keepa market score — non-financial only, for the practice lab.
// Suggests the "textbook" KeepaDecision so learners can check themselves.
// ─────────────────────────────────────────────────────────────────────────────

export interface KeepaMarketInput {
  category?: string;
  salesRank?: number;
  salesRankDrops?: number; // ~30-day; a proxy for monthly sales
  offerCount?: number;
  fbaSellerCount?: number;
  amazonInStockPercent?: number;
  currentBuyBox?: number;
  avg30DayPrice?: number;
  avg90DayPrice?: number;
}

export interface KeepaMarketVerdict {
  total: number; // 0-100 market quality
  label: string;
  suggestedDecision: string; // a KeepaDecision value
  bsr: BsrRating | null;
  salesPerSellerValue: number | null;
  greenFlags: string[];
  redFlags: string[];
  subScores: SubScore[];
}

export function scoreKeepaMarket(input: KeepaMarketInput): KeepaMarketVerdict {
  const green: string[] = [];
  const red: string[] = [];

  const verdict = scoreDeal({
    category: input.category,
    salesRank: input.salesRank,
    estimatedMonthlySales: input.salesRankDrops,
    fbaSellerCount: input.fbaSellerCount,
    totalOfferCount: input.offerCount,
    amazonPresence: presenceFromInStockPct(input.amazonInStockPercent),
    avg30DayPrice: input.avg30DayPrice,
    avg90DayPrice: input.avg90DayPrice,
    amazonPrice: input.currentBuyBox,
  });

  // Re-weight the non-financial pillars to 100 (velocity 35 / competition 30 /
  // amazon 20 / price 15) since there is no profit data in the practice lab.
  const vel = verdict.subScores.find((s) => s.key === "velocity")!;
  const comp = verdict.subScores.find((s) => s.key === "competition")!;
  const amz = verdict.subScores.find((s) => s.key === "amazon")!;
  const price = verdict.subScores.find((s) => s.key === "price")!;

  const velocity = Math.round((vel.score / vel.max) * 35);
  const competition = Math.round((comp.score / comp.max) * 30);
  const amazon = Math.round((amz.score / amz.max) * 20);
  const priceStab = Math.round((price.score / price.max) * 15);
  const total = velocity + competition + amazon + priceStab;

  green.push(...verdict.greenFlags);
  red.push(...verdict.redFlags.filter((f) => !f.toLowerCase().includes("roi") && !f.toLowerCase().includes("profitable")));

  // Suggested KeepaDecision based on the dominant signal.
  const presence = presenceFromInStockPct(input.amazonInStockPercent);
  const sellers = input.fbaSellerCount ?? 0;
  const tanking = (input.avg30DayPrice ?? 0) > 0 && (input.avg90DayPrice ?? 0) > 0 &&
    (input.avg30DayPrice as number) < (input.avg90DayPrice as number) * 0.92;
  const bsr = verdict.bsr;

  let suggestedDecision = "manual_review";
  if (presence === "dominant" || presence === "often") suggestedDecision = "amazon_dominated";
  else if (sellers > 20) suggestedDecision = "oversaturated";
  else if (tanking) suggestedDecision = "price_unstable";
  else if (bsr && bsr.bucket === "below") suggestedDecision = "not_enough_demand";
  else if (total >= 70) suggestedDecision = "good_buy";
  else if (total >= 50) suggestedDecision = "manual_review";
  else suggestedDecision = "too_risky";

  let label = "Risky";
  if (total >= 80) label = "Excellent market";
  else if (total >= 65) label = "Good market";
  else if (total >= 50) label = "Mixed — review";
  else if (total >= 35) label = "Weak market";

  const subScores: SubScore[] = [
    { key: "velocity", label: "Demand / Velocity", score: velocity, max: 35, note: vel.note },
    { key: "competition", label: "Competition", score: competition, max: 30, note: comp.note },
    { key: "amazon", label: "Amazon Risk", score: amazon, max: 20, note: amz.note },
    { key: "price", label: "Price Stability", score: priceStab, max: 15, note: price.note },
  ];

  return {
    total,
    label,
    suggestedDecision,
    bsr,
    salesPerSellerValue: verdict.salesPerSellerValue,
    greenFlags: green,
    redFlags: red,
    subScores,
  };
}
