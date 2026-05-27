import { Video } from "@/types";

const now = "2026-05-26T00:00:00.000Z";

/**
 * Curated practitioner content. Researched from the highest-rated FBA arbitrage
 * YouTube channels: Reezy Resells (15+ yrs, $6M+), Fields of Profit ($6M+, no paid ads),
 * Kev Blackburn (7-figure UK seller), plus topic-deep tutorials.
 *
 * Curriculum is organized around what experienced sellers say actually matters:
 * 1. Understand the model first (Week 1)
 * 2. Master Keepa — the single highest-leverage skill (Week 2)
 * 3. Combine SellerAmp + real sourcing reps (Week 3)
 * 4. Account health, operations, scale (Week 4)
 *
 * Importance tag: "critical" videos are non-negotiable for survival;
 * "core" videos are the central skill-building content;
 * "supporting" videos are second-pass or specialty topics.
 */
function v(
  id: string,
  day: number | null,
  week: number | null,
  title: string,
  link: string,
  channel: string,
  category: string,
  difficulty: Video["difficulty"],
  importance: "critical" | "core" | "supporting",
  whyIncluded: string,
  whatItTeaches: string,
  practiceTask: string,
  tags: string[],
  isBonus = false,
): Video {
  const importanceTag = importance === "critical" ? "★★★★★ Critical · " :
                        importance === "core" ? "★★★★ Core · " :
                        "★★★ Supporting · ";
  return {
    id,
    title,
    link,
    channel,
    category,
    difficulty,
    status: "not_started",
    rating: 0,
    keyTakeaways: "",
    timestampNotes: "",
    actionItems: "",
    relatedSkill: "",
    dateWatched: "",
    needRewatch: false,
    tags: [importance, ...tags],
    isSeeded: true,
    createdAt: now,
    sourceType: "YouTube Video",
    dayNumber: day ?? undefined,
    weekNumber: week ?? undefined,
    whyIncluded: importanceTag + whyIncluded,
    whatItTeaches,
    practiceTask,
    isBonus,
    confidenceScore: 0,
    mainIdea: "",
    rulesLearned: "",
    mistakesToAvoid: "",
    practiceCompleted: false,
    needsAIReview: false,
    dailyChecklist: {
      watchedVideo: false,
      tookNotes: false,
      addedTakeaways: false,
      completedPracticeTask: false,
      addedConfidence: false,
      markedRewatch: false,
    },
  };
}

export const SEED_VIDEOS: Video[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 1 — UNDERSTAND THE GAME
  // Goal: Build a clear mental model of FBA arbitrage before touching tools.
  // The #1 reason beginners fail isn't bad sourcing — it's not understanding the model.
  // ════════════════════════════════════════════════════════════════════════════

  v(
    "sv-d01", 1, 1,
    "Amazon FBA Retail Arbitrage Guide for Beginners (2025)",
    "https://www.youtube.com/watch?v=T3GCSORBDhA",
    "Reezy Resells",
    "FBA Foundations", "beginner", "critical",
    "Reezy has 15+ years and $6M+ in Amazon sales. This is the cleanest overview of how arbitrage actually works — no hype, no upsell.",
    "The full arbitrage loop: scan → analyze → buy → prep → ship → sell. The 5 steps you'll repeat thousands of times.",
    "Write out the 5 steps in your own words. If you can't explain one, rewatch that section.",
    ["Retail Arbitrage", "Mental Model", "Workflow"],
  ),

  v(
    "sv-d02", 2, 1,
    "How to Make Your First $1,000 with Retail Arbitrage",
    "https://www.youtube.com/watch?v=KEST1ogTbss",
    "Fields of Profit",
    "FBA Foundations", "beginner", "critical",
    "Fields of Profit did $6M+ on Amazon without paid ads. This video shows what 'success' actually looks like at the smallest scale — your first $1k.",
    "What the first 30-60 days really feel like. Expectations vs reality. The specific actions that produce the first $1k.",
    "Write your honest first-$1k target date. How many units, what ROI, how many hours/week?",
    ["First $1k", "Beginner Strategy", "Realistic Goals"],
  ),

  v(
    "sv-d03", 3, 1,
    "Complete Amazon Online Arbitrage Guide for Beginners (Free Course)",
    "https://www.youtube.com/watch?v=htkEXyV_tLs",
    "Fields of Profit",
    "FBA Foundations", "beginner", "critical",
    "Most arbitrage profit happens online, not in stores. This is the most-recommended OA starter video on YouTube.",
    "The OA process end-to-end: what tools, what retailers, what to look for, what to skip.",
    "List 5 online retailers you'll use as your starting sourcing base (e.g., Walmart, Target, Kohls, Vitacost, BBW).",
    ["Online Arbitrage", "Complete Guide", "Retailers"],
  ),

  v(
    "sv-d04", 4, 1,
    "How to Make Your First $10,000 PROFIT on Amazon",
    "https://www.youtube.com/watch?v=T-9rNtpMg8c",
    "Fields of Profit",
    "FBA Foundations", "intermediate", "core",
    "This bridges 'I made my first sale' to 'I have a real side business.' Most beginners stall around $1-3k/month — this video shows what unsticks them.",
    "The transition from sporadic flips to a systematized small operation.",
    "Define the 3 systems you need to build (sourcing routine, prep routine, restock routine) before you can scale past $3k/mo.",
    ["Scaling", "Systems", "$10k profit"],
  ),

  v(
    "sv-d05", 5, 1,
    "Profit Math Day — Master Your Fee Calculator",
    "",
    "Self-directed",
    "Profit Math", "beginner", "critical",
    "Profit miscalculation is the #2 cause of beginner failure (after IP suspension). You must internalize the math.",
    "How to calculate net profit, ROI, breakeven price, and minimum safe price for ANY product.",
    "Take 5 products from Amazon. Calculate: buy cost, FBA fee, referral fee (15%), shipping in, prep cost. What's your minimum sell price for 30% ROI?",
    ["Profit Math", "Fees", "ROI", "Breakeven"],
  ),

  v(
    "sv-d06", 6, 1,
    "Why People FAIL with Online Arbitrage on Amazon FBA",
    "https://www.youtube.com/watch?v=MlOh0cAL5ck",
    "Kev Blackburn / Live Learn Sell",
    "FBA Foundations", "beginner", "critical",
    "Kev built a 7-figure UK Amazon business and runs a fulfillment franchise. Knowing why people fail is more valuable than another success story.",
    "The specific patterns of failure: unrealistic expectations, undercapitalization, no systems, no patience.",
    "Identify which 2 failure patterns YOU are most at risk of. Write a mitigation plan.",
    ["Failure Modes", "Risk Awareness", "Mindset"],
  ),

  v(
    "sv-d07", 7, 1,
    "Practice Day — Run a Mock Sourcing Session",
    "",
    "Self-directed",
    "Practice", "beginner", "critical",
    "Week 1 was theory. Today you test if it stuck. No money spent — just decision-making reps.",
    "Whether you can spot a potentially profitable product without buying it.",
    "Browse one retailer's clearance section. Find 10 products. For each, write: estimated buy cost, Amazon price, gut-check ROI. Then verify with Amazon search.",
    ["Practice", "Mock Sourcing", "Decision Reps"],
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 2 — MASTER KEEPA
  // Goal: Build the single highest-leverage skill in arbitrage.
  // Every successful seller says: "If I could only teach beginners one thing, it's Keepa."
  // ════════════════════════════════════════════════════════════════════════════

  v(
    "sv-d08", 8, 2,
    "How to Read a Keepa Chart — Beginners Guide",
    "https://www.youtube.com/watch?v=VLIJiqWy75I",
    "Keepa Tutorial",
    "Keepa", "beginner", "critical",
    "Start here. The cleanest first explanation of what the lines on a Keepa chart actually mean.",
    "Buy Box line, Amazon line, sales rank line, offer count line — what each tells you about a product.",
    "Pull up any Amazon product, open Keepa, identify all 4 lines without help. Screenshot when correct.",
    ["Keepa Basics", "Chart Reading", "Lines"],
  ),

  v(
    "sv-d09", 9, 2,
    "Keepa Tutorial for Amazon Arbitrage Beginners",
    "https://www.youtube.com/watch?v=fKAUlgC1JRA",
    "Keepa for Arbitrage",
    "Keepa", "beginner", "critical",
    "Connects Keepa READING to buy/skip DECISIONS. Most tutorials show the chart but skip the decision framework.",
    "Decision rules: which chart patterns mean BUY, which mean SKIP, which mean NEED MORE DATA.",
    "List 5 chart patterns that mean SKIP. Why each one?",
    ["Decision Framework", "Skip Signals", "Patterns"],
  ),

  v(
    "sv-d10", 10, 2,
    "How to Read Keepa Charts & Analyze Deals",
    "https://www.youtube.com/watch?v=qf628VraSjU",
    "Deal Analysis Live",
    "Keepa", "intermediate", "core",
    "Watch an experienced seller talk through real Keepa analyses out loud. This is the 'thinking partner' you need.",
    "The internal monologue of a Keepa analysis — what they look at first, second, third. Pattern recognition through observation.",
    "Pick 3 random ASINs. Narrate your Keepa analysis out loud (record yourself). Listen back — where were you uncertain?",
    ["Live Analysis", "Thinking Aloud", "Pattern Recognition"],
  ),

  v(
    "sv-d11", 11, 2,
    "How to Use Keepa for Amazon FBA — Beginner to Expert",
    "https://www.youtube.com/watch?v=J5qA26neEaw",
    "Keepa Full Guide",
    "Keepa", "intermediate", "core",
    "The deepest single-video Keepa walkthrough on YouTube. Slow down playback if needed.",
    "Settings, drop counts, sales estimation, offer history filtering. The advanced features that separate beginners from intermediate.",
    "Configure your Keepa extension with the recommended settings shown. Screenshot your settings page.",
    ["Keepa Settings", "Drop Counts", "Sales Estimation"],
  ),

  v(
    "sv-d12", 12, 2,
    "How to Use Keepa for Online Arbitrage in 2026",
    "https://www.youtube.com/watch?v=MAFpI4Wdd4w",
    "Fields of Profit",
    "Keepa", "intermediate", "core",
    "Fields of Profit's latest Keepa video — UI changes every few months and old tutorials get stale.",
    "What Keepa looks like RIGHT NOW vs what older tutorials showed. New features to use, old features that changed.",
    "Compare this UI to yesterday's older tutorial. Note 3 differences. Adjust your mental model.",
    ["Latest UI", "2026", "Updates"],
  ),

  v(
    "sv-d13", 13, 2,
    "Keepa Reps Day — Analyze 20 Live Charts",
    "",
    "Self-directed",
    "Practice", "intermediate", "critical",
    "Theory only gets you so far. Real Keepa skill comes from VOLUME. Today you do 20 chart analyses.",
    "Pattern recognition through reps.",
    "Open 20 Amazon products. For each, write 1-line verdict in your Keepa Lab: BUY, SKIP, or NEED MORE DATA. Save the hardest call as a flashcard.",
    ["Volume Practice", "20 Reps", "Pattern Library"],
  ),

  v(
    "sv-d14", 14, 2,
    "Keepa Mastery Self-Test — Can You Teach It?",
    "",
    "Self-directed",
    "Practice", "intermediate", "critical",
    "If you can teach a concept clearly to someone who doesn't know it, you've actually learned it. This is the test for Week 2.",
    "Whether your Keepa knowledge is real or surface-level.",
    "Find a friend (or imagine teaching one). Walk them through one Keepa chart. If they ask a question you can't answer, that's your weak spot — write it down.",
    ["Self-Test", "Teaching", "Knowledge Check"],
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 3 — SELLERAMP + REAL SOURCING
  // Goal: Stack SellerAmp on top of Keepa. Then do real sourcing reps.
  // ════════════════════════════════════════════════════════════════════════════

  v(
    "sv-d15", 15, 3,
    "How to Use SellerAmp & Keepa for Product Research",
    "https://www.youtube.com/watch?v=jmDnyPPpGKI",
    "SAS + Keepa Combined",
    "SellerAmp", "intermediate", "critical",
    "Most tutorials teach SellerAmp OR Keepa. This shows the combined workflow that experienced OA sellers actually use.",
    "How SellerAmp and Keepa complement each other — what each tool is better at, when to use which.",
    "Install both extensions. Run the same 3 products through both. Note where they agree and disagree.",
    ["SellerAmp", "Combined Workflow", "Tool Stack"],
  ),

  v(
    "sv-d16", 16, 3,
    "SellerAmp Complete Tutorial",
    "https://www.youtube.com/watch?v=QnyVWTZWafY",
    "SAS Deep Dive",
    "SellerAmp", "intermediate", "core",
    "Every tab, every field, every button. Use this as your SellerAmp reference manual.",
    "All SellerAmp panels: profitability, sales, competition, restrictions, IP alerts.",
    "Rebuild SellerAmp's 'green checks' criteria from memory after watching. What does each check actually verify?",
    ["SellerAmp Reference", "All Panels", "Green Checks"],
  ),

  v(
    "sv-d17", 17, 3,
    "SellerAmp Tutorial 2025 — Latest UI",
    "https://www.youtube.com/watch?v=eCIlNROAG48",
    "SAS 2025",
    "SellerAmp", "intermediate", "supporting",
    "SellerAmp UI changed in late 2024. Use this if you're confused by differences between newer and older tutorials.",
    "What changed recently and how to adapt your workflow.",
    "Spot 3 UI differences between this and the older tutorial.",
    ["Latest UI", "2025 Updates", "Adaptation"],
  ),

  v(
    "sv-d18", 18, 3,
    "Amazon FBA Online Arbitrage Sourcing — The Best Websites",
    "https://www.youtube.com/watch?v=LjPNAj4STOk",
    "OA Sourcing Sites",
    "Sourcing", "intermediate", "core",
    "Most beginners only know Walmart and Target. There are dozens of profitable OA sites — this list will expand your sourcing surface 10x.",
    "Which retailers experienced OA sellers actually source from, and why.",
    "Pick 3 sites from the video you've NEVER sourced from. Spend 20 min on each.",
    ["Sourcing Sites", "Retailer List", "Surface Expansion"],
  ),

  v(
    "sv-d19", 19, 3,
    "The Best Online Arbitrage Sourcing Method (2024 — Beginners)",
    "https://www.youtube.com/watch?v=cYr76h3N0Bc",
    "OA Sourcing Method",
    "Sourcing", "intermediate", "core",
    "Shows the actual screen-by-screen sourcing process — most tutorials abstract it. Watch the mouse movements, not just the words.",
    "Reverse sourcing from storefronts vs. category browsing on retailer sites.",
    "Pick one retailer. Spend 30 min reverse-sourcing one competitor storefront.",
    ["Reverse Sourcing", "Screen-by-Screen", "Practice"],
  ),

  v(
    "sv-d20", 20, 3,
    "Sourcing Reps Day — Find 30 Real Products",
    "",
    "Self-directed",
    "Practice", "intermediate", "critical",
    "Speed of analysis comes from volume. Today you analyze 30 products. Goal: under 90 seconds per product by end of session.",
    "Speed and efficiency in product analysis.",
    "Time yourself on 30 products. Record your average analysis time. Aim to halve it next week.",
    ["Volume Practice", "Speed", "30 Products"],
  ),

  v(
    "sv-d21", 21, 3,
    "Define YOUR Personal Buy Criteria",
    "",
    "Self-directed",
    "Strategy", "intermediate", "critical",
    "You've seen enough now to define YOUR buy box. Different sellers have different risk tolerances — yours will be unique.",
    "Translating learning into your own decision framework.",
    "Write your buy criteria on ONE page: min ROI %, max FBA sellers, min sales rank %, categories to avoid, max buy cost. Tape it above your desk.",
    ["Personal Strategy", "Buy Box", "Decision Framework"],
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 4 — ACCOUNT HEALTH, OPERATIONS, SCALE
  // Goal: Avoid suspension. Build the operational machinery. Plan to scale.
  // Most sellers fail at this stage — not from bad sourcing, but from operational chaos.
  // ════════════════════════════════════════════════════════════════════════════

  v(
    "sv-d22", 22, 4,
    "IP Violations on Amazon — How to Spot and Avoid",
    "https://www.youtube.com/watch?v=FW64wCdcLgE",
    "Account Health",
    "Risk Management", "intermediate", "critical",
    "ONE IP complaint can suspend your account. Prevention is everything. This is non-negotiable.",
    "Which brands are most likely to file IP claims, how to research before buying, what to do if you get hit.",
    "Build your NO-BUY brand list. Start with brands flagged in this video + any others you've seen mentioned.",
    ["IP Risk", "Account Health", "Brand Avoidance"],
  ),

  v(
    "sv-d23", 23, 4,
    "How to Get UNGATED in ANY Brand on Amazon FBA (2026)",
    "https://www.youtube.com/watch?v=cvNPdHoHTUA",
    "Ungating 2026",
    "Ungating", "intermediate", "critical",
    "Most profitable products are in gated brands. Getting ungated unlocks 10x your sourcing universe.",
    "What ungating actually requires: invoices from authorized distributors, the application process, common rejection reasons.",
    "Pick ONE brand you'd love to sell. Check its gating status. Read the requirements. Take screenshots.",
    ["Ungating", "Brand Approval", "Invoices"],
  ),

  v(
    "sv-d24", 24, 4,
    "How to Get Ungated FAST in 2026 — Auto-Ungates & Denials",
    "https://www.youtube.com/watch?v=H3gtHHVS48E",
    "Auto-Ungating",
    "Ungating", "intermediate", "core",
    "Some brands auto-ungate without paperwork; some auto-deny. Knowing which is which saves hours.",
    "The auto-ungate strategy and how to handle common denial reasons.",
    "Try to auto-ungate 3 brands. Document the outcome (instant approval, denied, asked for invoice).",
    ["Auto-Ungating", "Denials", "Fast Approval"],
  ),

  v(
    "sv-d25", 25, 4,
    "FBA Prep Mastery — Labels, Poly Bags, Bubble Wrap",
    "",
    "Self-directed",
    "FBA Operations", "intermediate", "core",
    "Bad prep = damaged inventory = refunds. Amazon's prep service is being discontinued for US sellers in 2026 — you'll need to prep yourself or pay a 3PL.",
    "Poly bag requirements (1.5mil, suffocation warning), labeling rules, the 3-foot drop test for fragile items.",
    "Read MyFBAPrep's 2025 prep guide. Buy: thermal label printer, 1.5mil poly bags, bubble wrap. Cost ~$120.",
    ["Prep", "Labels", "Poly Bags", "Drop Test"],
  ),

  v(
    "sv-d26", 26, 4,
    "Amazon FBA Restock Inventory Step-by-Step",
    "https://www.youtube.com/watch?v=3yIAUoqz5N8",
    "Restock Tutorial",
    "Inventory", "intermediate", "core",
    "Inventory mismanagement is the #1 reason small sellers stall. Stockouts kill momentum; overstocks kill cash.",
    "Choosing what to restock, calculating reorder quantity, creating an FBA shipment plan.",
    "If you have any active inventory: build a restock spreadsheet. Otherwise: build the template for when you do.",
    ["Restock", "Reorder Points", "Shipment Plans"],
  ),

  v(
    "sv-d27", 27, 4,
    "Tactical Arbitrage — Automating OA Sourcing",
    "https://www.youtube.com/watch?v=_7TjFs2PONE",
    "Tactical Arbitrage",
    "Sourcing", "advanced", "supporting",
    "TA scales sourcing 10-100x but costs $89-$129/mo. Watch FIRST. Subscribe only when you can pay for it from profits.",
    "What TA does, when it's worth the cost, how it changes your workflow.",
    "Decide your monthly-profit threshold for subscribing to TA. Write the number down.",
    ["Tactical Arbitrage", "Scaling", "Automation"],
  ),

  v(
    "sv-d28", 28, 4,
    "First Test Buy Day",
    "",
    "Self-directed",
    "Action", "advanced", "critical",
    "The gap between 'analyst' and 'seller' is the buy button. Cross it. The product can be small — what matters is taking action.",
    "What it feels like to commit capital based on your own analysis.",
    "Pick ONE product from Day 20's list. Buy 3-5 units. Total cost should be under $100. Log every step.",
    ["First Buy", "Action", "Test Purchase"],
  ),

  v(
    "sv-d29", 29, 4,
    "Business Setup — LLC, Sales Tax, 1099-K Reality",
    "",
    "Self-directed",
    "Business", "intermediate", "core",
    "You don't need an LLC on day 1, but if you're crossing $2,500 in sales (2025) or $600 (2026), the IRS will know via 1099-K. Be ready.",
    "LLC vs sole prop, sales tax nexus, 1099-K reporting thresholds, deductible expenses.",
    "Open a separate bank account JUST for arbitrage (free at most banks). Apply for an EIN online (free, 5 min).",
    ["LLC", "Sales Tax", "1099-K", "Bookkeeping"],
  ),

  v(
    "sv-d30", 30, 4,
    "Graduation — Build Your 90-Day Plan",
    "",
    "Self-directed",
    "Planning", "advanced", "critical",
    "30 days of learning is foundation. The next 60 days decide if you become a seller or stay a student.",
    "Self-assessment, weak-spot identification, and a concrete 90-day plan.",
    "Write your 90-day plan in ONE page: monthly profit goal, hours/week, weakest skill to deepen, single tool to subscribe to.",
    ["90-Day Plan", "Graduation", "Goal Setting"],
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // BONUS — Keep learning beyond day 30
  // ════════════════════════════════════════════════════════════════════════════

  v(
    "sv-b01", null, null,
    "Bonus: Short Arbitrage Advice from Successful Resellers",
    "https://www.youtube.com/watch?v=GlvfcsYbqxw",
    "Kev Blackburn / Live Learn Sell",
    "Bonus", "intermediate", "supporting",
    "Interview-style content. Pattern-match across multiple successful sellers — what do they ALL say?",
    "The shared mental models of profitable arbitragers.",
    "List 3 pieces of advice that appear in multiple interviews. Those are the universal truths.",
    ["Interviews", "Mental Models", "Multiple Sellers"],
    true,
  ),

  v(
    "sv-b02", null, null,
    "Bonus: Tactical Arbitrage CRASH Course",
    "https://www.youtube.com/watch?v=I6yutbEJcDo",
    "TA Crash Course",
    "Bonus", "advanced", "supporting",
    "Once you've decided to subscribe to TA, this is the fastest way to be productive with it.",
    "TA configuration, filters, and workflow.",
    "After subscribing: set up your first TA scan. Document what filters you used and why.",
    ["Tactical Arbitrage", "Automation", "Scaling"],
    true,
  ),

  v(
    "sv-b03", null, null,
    "Bonus: Struggling to Manage Inventory? Watch This",
    "https://www.youtube.com/watch?v=REHlElh9yyQ",
    "Inventory Management",
    "Bonus", "intermediate", "supporting",
    "Inventory chaos kills sellers around month 3-6. This video is the most-recommended remedy.",
    "Inventory systems and reorder workflows that scale.",
    "Build (or refine) your inventory tracking spreadsheet/tool.",
    ["Inventory", "Systems", "Scaling"],
    true,
  ),

  v(
    "sv-b04", null, null,
    "Bonus: Revealing 5 Real Products You Can Sell on OA",
    "https://www.youtube.com/watch?v=D0GSk5_3wFg",
    "Real Product Examples",
    "Bonus", "beginner", "supporting",
    "Concrete examples are worth 10 abstract explanations. See what real profitable products actually look like.",
    "What 'good' looks like at a product level.",
    "For each product shown, run YOUR analysis. Would YOU have bought it? Why or why not?",
    ["Real Products", "Examples", "Calibration"],
    true,
  ),

  v(
    "sv-b05", null, null,
    "Bonus: Reezy Live Sourcing in Walmart",
    "https://www.youtube.com/watch?v=T3GCSORBDhA",
    "Reezy Resells",
    "Bonus", "intermediate", "supporting",
    "Live in-store footage is rare and incredibly valuable for pattern recognition.",
    "What an experienced seller actually looks at in-store.",
    "Next time you're in a big-box retailer, mentally scan one aisle as if sourcing.",
    ["Live Sourcing", "Retail Arbitrage", "In-Store"],
    true,
  ),
];
