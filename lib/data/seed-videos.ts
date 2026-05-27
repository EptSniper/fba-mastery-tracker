import { Video } from "@/types";

const now = "2026-05-26T00:00:00.000Z";

/**
 * Curated practitioner content. Researched from the highest-rated FBA arbitrage
 * YouTube channels: Reezy Resells (15+ yrs, $6M+), Fields of Profit ($6M+, no paid ads),
 * Kev Blackburn (7-figure UK seller), plus topic-deep tutorials.
 *
 * v5: each video ships with a pre-written description (no API call needed at runtime).
 * Descriptions are written practitioner-voice, ~150-200 words each, designed to brief
 * a learner before they hit play.
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
  aiDescription: string,
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
    aiDescription,
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
    `This is your foundation. Reezy has been doing this for 15+ years and has done over $6M on Amazon — when someone with that track record sits down to explain the model from scratch, you listen. Expect a walkthrough of the full retail arbitrage loop: how you find products in physical stores, what scanning apps you use, what data points actually matter, and what happens between buying a product and getting paid for it. He'll likely also touch on common beginner mistakes and what realistic first-year economics actually look like.

The value here isn't memorizing steps — it's installing the mental model. Once you understand "what is the actual business I'm in," every later video makes more sense.

Things to watch for: (1) the exact sequence Reezy uses when he scans a product — the order matters; (2) what data points on the scanner display he glances at first vs. ignores; (3) any specific dollar thresholds he mentions (min ROI, min profit per unit); and (4) any categories or types of products he tells you to stay away from on day one. Those four notes alone are worth more than the next ten "how to start" videos you'll see.`,
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
    `Fields of Profit did $6M in revenue without paid ads, so when he talks about "first $1k" he's not selling a fantasy — he's describing a milestone he watched hundreds of his students hit (and watched others fail to hit). This video is about calibrating your expectations. Most beginners either over-promise themselves ("I'll make $5k my first month") or under-budget for time ("I'll do this in 2 hours a week and be rich"), and both of those mistakes kill momentum within 60 days.

Your job in this video isn't to memorize — it's to honestly map this onto your life. How many hours per week can you really commit? Are you sourcing in-store, online, or both? What's your starting capital? Those answers determine whether your first $1k takes 2 weeks or 2 months.

Things to watch for: (1) the unit count and average profit per unit needed to clear $1k profit; (2) hours per week he assumes; (3) the cash-flow reality — you spend before you get paid, and at this scale that gap can feel painful; and (4) the specific mistakes that keep beginners from reaching this first milestone.`,
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
    `This is one of the most-recommended OA starter videos on YouTube for a reason — it's structured like a free course rather than a hype reel. Online arbitrage is where most arbitrage profit actually happens these days (retail arbitrage scales poorly because you have to drive somewhere), and the workflow is different enough from RA that it deserves its own foundation video.

Expect coverage of the OA-specific stack: browser extensions, retailer accounts, how you actually browse a retailer's site looking for deals, what's different about returns and shipping costs when you're not physically holding the product. He'll also probably talk about credit card cashback (a real profit lever in OA — the difference between a 5% margin and an 8% margin) and which retailers are "OA-friendly" vs. hostile to resellers.

Things to watch for: (1) the specific retailers he names as starting points; (2) any browser extensions he installs (write down each one); (3) whether he sources from category browsing or from specific deal sites; and (4) how he handles cashback and credit card stacking — this is where 2-5% of your margin lives or dies, and most beginners ignore it.`,
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
    `This video bridges "I made my first flip" to "I run a small business." Most beginners stall in the $1-3k/month profit range because they're operating like a side hobby — sourcing when they feel like it, prepping in chaotic batches, no real reorder discipline. The jump to $10k profit isn't about finding 10x better products; it's about building systems so you can run the same workflow 10x more often without burning out.

You're watching this on Day 4, before you've made a single sale — that's intentional. Knowing what the destination looks like helps you build correctly from day one rather than have to rebuild later when bad habits are already baked in.

Things to watch for: (1) the systems or routines he mentions — sourcing days, prep days, restock days — there's usually a weekly rhythm; (2) any specific tooling that becomes worth its cost at this scale (Tactical Arbitrage, OA Genius, etc.); (3) the cash flow trap most people hit around $3-5k revenue, where they're profitable on paper but cash-poor; and (4) what he says about hiring help — bookkeeper, prep service, VA — and at what revenue it makes sense.`,
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
    `No video today. Profit miscalculation is the second-most-common reason beginners lose money (right after IP suspensions), and the only fix is to do the math by hand enough times that it becomes muscle memory. By the end of today, you should be able to look at any Amazon product and quickly estimate whether it's a buy without opening a calculator. This is the practice that separates people who "understand fees in theory" from people who can spot a bad deal in 5 seconds.

What to actually do: pick 5 products from Amazon. For each one, calculate net profit step by step — buy cost, inbound shipping (figure ~$0.40/lb to Amazon), prep cost (~$0.50-$1/unit if you DIY, more if 3PL), FBA fulfillment fee (Amazon's fee calculator at sellercentral.amazon.com/fba/profitabilitycalculator gives this), referral fee (15% of sell price for most categories), then sell price minus all of those equals net profit. ROI equals profit divided by total cost.

Write each calculation on paper, not in a tool — the goal is to internalize the structure, not just get a number. Once you've done five by hand, the sixth will take 30 seconds in your head.`,
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
    `Kev built a 7-figure UK Amazon business and now runs a fulfillment franchise — he's seen thousands of beginners come and go. There's a counterintuitive truth here: watching ONE good "why people fail" video is worth more than watching ten "how I made $100k" videos. Survivorship bias means success stories overweight luck and timing. Failure analysis tells you the actual common rocks people crash on, and those are usually the same 4-5 rocks every time.

Watch this video looking for yourself, not other people. Honest self-recognition here can save you 6 months and several hundred dollars.

Things to watch for: (1) the patterns of failure he names — likely a mix of unrealistic expectations, undercapitalization, no patience for the cash cycle, treating it as get-rich-quick; (2) which mistakes are recoverable vs. which kill the business permanently; (3) any specific dollar thresholds he mentions for "minimum capital to start sensibly"; and (4) the emotional patterns — quitting too early, scaling too fast, panic-selling at a loss. Be honest about which one or two you're most at risk of. Write them down.`,
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
    `Week 1 was theory. Today proves whether any of it stuck. You're not spending money today — you're spending decision-making reps. Decisions are the muscle of this business, and like any muscle they only grow under load.

What to actually do: open one retailer's clearance or sale section — Walmart Clearance, Target Clearance, Kohls Yes2You deals, anything you can browse online. Find 10 random products. For each one, before searching Amazon, write down your gut estimate: what would this sell for on Amazon? What ROI does it look like at clearance price? Would I buy this if I had to decide right now? Then look it up on Amazon and verify. How far off were your estimates?

The point isn't to find a winner today — you won't, and that's fine. The point is to expose your blind spots before they cost you real money. Note every product where your gut was more than 30% off the actual Amazon price — those are categories you don't have a feel for yet. Week 2 (Keepa) will sharpen that intuition into a real skill, but you need the calibration check first.`,
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 2 — MASTER KEEPA
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
    `Welcome to Week 2. Keepa is the single highest-leverage tool in arbitrage — every successful seller agrees on this. Today's video is your absolute foundation: just learning what the colored lines on a Keepa chart actually mean. Don't try to make buy decisions from charts yet. Just get the visual vocabulary down so the rest of this week makes sense.

A Keepa chart looks chaotic on day one. By Day 14 it'll look as readable as a clock face. That transition only happens with reps, and reps require knowing what you're looking at.

Things to watch for: (1) the four core lines — Buy Box price (pink/orange), Amazon's own price when present (orange), sales rank (green, inverted), and offer count (blue); (2) what an inverted sales rank graph means — lower number equals BETTER seller, which confuses everyone the first time; (3) how to read the time scale and zoom in or out to see different windows; and (4) what a "drop" in the sales rank line actually represents — a sale happened. Pause the video and try to identify each line on your own before he names it. That's the test.`,
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
    `Yesterday's video taught you what the lines mean. Today's video teaches you what to DO about them. Most Keepa tutorials stop at chart literacy — this one connects pattern recognition to buy/skip decisions, which is where the actual business happens.

You're looking to leave today with at least 3-4 clear "if I see X, I skip" rules. Those rules become your floor — they protect you from buying obvious losers while you build judgment on the marginal cases. Marginal cases are where money is made; obvious losers are where money is wasted.

Things to watch for: (1) the specific patterns he labels as immediate skips — likely things like "Amazon is in the buy box consistently," "price is currently above the 90-day average," "offer count is spiking upward"; (2) what a healthy buy pattern looks like — steady price, regular rank drops, moderate offer count, Amazon not present; (3) the difference between "this is currently selling" and "this used to sell" — a chart can look beautiful but be 6 months stale; and (4) any heuristics for how many rank drops per month equal a buy. Write those numbers down.`,
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
    `Yesterday was rules. Today is watching an experienced seller think out loud. This is the "thinking partner" content that's surprisingly hard to find on YouTube. Listening to someone narrate their decision process — what they look at first, what they dismiss in 2 seconds, what makes them pause — accelerates your pattern recognition faster than another rules-based tutorial.

Try to predict the seller's verdict before they announce it. Then notice where you guessed wrong and ask yourself why. That gap between your prediction and theirs is your remaining learning.

Things to watch for: (1) the SEQUENCE of what they check — most experienced sellers have a fixed order; do they look at sales rank first, or buy box stability, or offer history; (2) the questions they ask out loud — "how many sellers were here 90 days ago?" "is this a seasonal pattern?" — these are the questions you should be asking too; (3) any deals they REJECT that you thought looked good — these are the most instructive moments; and (4) their stated minimum criteria — if they say "I want at least X rank drops per month," write that number down. Build your own checklist from the patterns you hear repeated.`,
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
    `This is the deepest single-video Keepa walkthrough on YouTube. It's long. Slow down playback to 0.75x if needed. Pause often. This video moves you from "I can read a chart" to "I understand Keepa's full feature set" — drop counts, sales estimation, offer history filtering, the Product Finder tab, the Seller view.

You probably won't internalize everything today and that's fine. The goal is to know what Keepa CAN do so you know what to come back to when you need it. Think of it as a reference video, not a one-time watch.

Things to watch for: (1) the exact Keepa settings he recommends — screenshot his settings panel and copy them onto yours; the defaults aren't optimal for arbitrage; (2) the difference between "sales rank drops" and "sold units" — drops are an approximation, not a precise count; (3) the Buy Box ownership panel — who's been in the buy box, for what % of the last 30/90/180 days; and (4) Keepa's offer history feature — how to see if a specific seller showed up and crashed the price recently. These features come up constantly in advanced analysis.`,
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
    `UI changes break old tutorials. Keepa adds and renames panels every few months, and a tutorial from 2023 may show buttons that no longer exist or are now in different locations. This is the most current Keepa walkthrough specifically framed for the online arbitrage workflow. If yesterday's deeper tutorial had buttons that didn't quite match your screen, today fixes that.

The two-day pairing is deliberate — Day 11 gives you depth, Day 12 gives you currency. Together they cover what you actually need.

Things to watch for: (1) any panels or features that look different from yesterday's tutorial — note the differences so you can update your mental map; (2) features he uses that the older video skipped (and vice versa) — these tell you what's become more important recently; (3) the specific OA workflow he runs — how does he move from "extension opens on a Walmart product" to "I've decided to buy or skip"; and (4) any data points he says have BECOME more important recently. Keepa best practices shift with Amazon's policies and competitive landscape — what mattered in 2023 isn't always what matters in 2026.`,
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
    `Today is volume. Theory got you here; only reps will get you further. You've spent Days 8-12 learning what charts mean — today you analyze 20 live charts and produce a one-line verdict on each. The goal isn't to find a winner. The goal is to do the analysis fast enough, and confidently enough, that pattern recognition starts to feel like reflex rather than effort.

What to actually do: open 20 random Amazon products — from Amazon's bestseller pages, from your own browsing, from products you saw mentioned in earlier videos, anywhere. For each one, open Keepa, look at the chart, and write a one-line verdict in your Keepa Lab page: BUY, SKIP, or NEED MORE DATA — plus one sentence on why.

Time yourself. By product 20 you should be averaging under 60 seconds per chart. If you're still at 3+ minutes by product 10, your decision rules are too vague — go back and tighten them. Save the 2-3 hardest calls as flashcards so you can revisit them later. If you can't get to a verdict in 90 seconds, your default is SKIP. That itself is a useful skill — most products you see are not buys.`,
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
    `The Feynman test: if you can teach a concept to someone who doesn't know it, you actually understand it. If you can't, you have surface knowledge that won't survive contact with a real buy decision. Today is the test for Week 2.

What to actually do: find a friend (or imagine one — record yourself talking to a camera, it works almost as well) and walk them through a Keepa chart from scratch. Pretend they know nothing. Explain each line, explain what makes this product a buy or skip, anticipate their questions.

The questions you can't answer are your weak spots. Write each one down — those are your remaining Keepa knowledge gaps and they'll cost you money if you don't close them. Common ones beginners can't answer well: "what's the difference between buy box price and lowest FBA offer price?" "how do I know if a rank drop was a sale or a return?" "why does Amazon's presence on the chart matter so much?" "what does 90-day average price tell me that 30-day average doesn't?" If you stumble on any of those, go back to the Day 11 deep-dive video and re-watch that section specifically. Don't move into Week 3 with Week 2 gaps.`,
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 3 — SELLERAMP + REAL SOURCING
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
    `Welcome to Week 3. SellerAmp (sometimes called "SAS") is the second-most-important tool after Keepa for online arbitrage. Most tutorials teach SellerAmp OR Keepa, treating them as alternatives. They aren't — experienced OA sellers run BOTH at the same time, because they answer different questions. Keepa shows you price/rank/competition history; SellerAmp shows you instant profitability math, restrictions, IP warnings, and live competition. This video shows the combined workflow.

Things to watch for: (1) which tool he opens first when he's evaluating a product — the order signals the priority; (2) which data point he treats as authoritative when the two tools disagree — they sometimes will, and which one you trust matters; (3) the specific SellerAmp panels he uses for buy decisions vs. the panels he ignores — SellerAmp is information-dense and most of it is noise on any given product; and (4) how he handles SellerAmp's green/red "checks" — those checks are useful but should never be your only decision input. Watch how he overrides them when his Keepa read tells him otherwise.`,
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
    `Use this as your reference manual. Every panel, every field, every button — what does it mean, when do you look at it, when do you ignore it. You don't need to memorize today's content; you need to know what's where so you can come back to it when you need it. The SellerAmp interface is denser than Keepa's. Don't be intimidated by the wall of information — most of it you'll only glance at briefly each time, but the right panel at the right moment can save you from a bad buy.

Things to watch for: (1) the green/yellow/red check criteria — what does each check actually verify? Sales Per Month check, Number of Sellers check, ROI check — they each have a specific rule behind them; (2) the Hazmat / IP / Variation warnings — these are the kill-switches that should stop a deal cold; (3) the BSR chart inside SellerAmp (separate from Keepa's, used differently — it shows the BSR distribution for the category); and (4) the multi-pack and bundle detection — SellerAmp is better than Keepa at flagging when an Amazon listing is a different pack size than your source listing, which is a brutal beginner trap. Get familiar with where it shows that warning.`,
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
    `Same rationale as Day 12 — UI changes deserve their own check-in. Watch this if you're confused by differences between newer SellerAmp tutorials and older ones, or if the panels in yesterday's video don't quite match your screen. If everything looked the same as yesterday, this is a quick watch; if things looked off, this is your calibration video.

Things to watch for: (1) any new panels added in 2024-2025 — variation matching, IP alerts, hazmat detection have all improved recently; (2) renamed or relocated buttons — sometimes the same feature moves to a new menu and tutorials don't catch up; (3) any features that have changed default behavior — what counts as a "green check" criteria may have tightened or loosened; and (4) any new integrations — SellerAmp's API connections to other tools change every few months and are sometimes worth using (e.g., quick handoff to Buy Bot Pro or to a price-list scanner).

If this video shows nothing surprising vs. yesterday's, that's good news — your version is current and you can spend the rest of the day on real sourcing reps.`,
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
    `Most beginners only know Walmart and Target. The actual OA universe is dozens of sites — pharmacy chains, beauty retailers, big-box specialty stores, niche home goods sites, sports retailers, even university bookstores. Each has different deal patterns, different cashback rates, different shipping economics, and different competition density. Today's video expands your sourcing surface dramatically.

This isn't about chasing the "secret site" — it's about having more places to look so you don't burn out hitting the same two retailers everyone else is hitting (which is what happens to most beginners around month 2 when Walmart starts feeling sourced-out).

Things to watch for: (1) the specific retailers he names — make a list right now, you'll work through it this week; (2) any cashback portals (Rakuten, TopCashback, RetailMeNot, Honey) that stack with these sites — that's pure margin; (3) which sites are best for which categories — Vitacost for supplements, BBW for personal care, Kohls for kitchen, Dick's for sporting goods; and (4) which sites have GENEROUS return policies. You'll need that when products arrive wrong or damaged, which happens 1-3% of the time and can wipe a week's profit if returns are restricted.`,
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
    `Most sourcing tutorials abstract away the actual screen — they show charts and decision rules but not the mouse movements. This video does the opposite: it shows the literal screen-by-screen process of sourcing, including the moments where the seller pauses, scrolls, narrows a filter, and makes the call. Watch the mouse movements as much as you listen to the narration.

The two big approaches you'll see: (a) category browsing — go to a retailer's clearance category and walk through pages one by one; (b) reverse sourcing — find a competitor selling well on Amazon and trace their products back to their source retailer. Reverse sourcing is more efficient once you know how to find competitors; category browsing is the only option when you're starting from scratch with no competitor list.

Things to watch for: (1) the speed — experienced sourcers spend 5-10 seconds per product before moving on, not 30; that pace is the goal; (2) the filters they apply on retailer sites — price range, brand, category, % off; (3) how they handle the moment of pulling up Keepa on a candidate, including which tab they switch to first; and (4) any mental rules of thumb they verbalize ("if it's a major brand I check IP first," "if it's a multipack I check pack-size match first"). Steal every shortcut you can.`,
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
    `Today is volume, focused on speed. Last week you did 20 Keepa analyses; this week, 30 product analyses end-to-end. The goal: by product 30, you're under 90 seconds per product from "open the candidate" to "BUY or SKIP."

Speed at this stage is not about cutting corners — it's about not wasting time on obvious skips. Most products you see are not buys, and you need to learn to recognize "not a buy" in 30 seconds so you can spend your real attention on the maybes. The maybes are where the actual profit hides.

What to actually do: pick one retailer from yesterday's list (Day 18). Open their clearance section. Work through 30 products in order. For each, run your Keepa + SellerAmp check, write a one-line verdict in your dashboard, and move on. Time yourself with a stopwatch. Record your average per-product time at the end.

Note the products that took the longest — those are your remaining ambiguity zones. Why did they take so long? Was it a Keepa pattern you weren't sure about? A pack-size question? An IP concern? Each ambiguity zone is a specific knowledge gap you can target tomorrow. Tomorrow's "personal buy criteria" exercise will help close most of them.`,
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
    `You've now seen enough deals to know what YOUR risk tolerance is. Two sellers can look at the same product and come to opposite conclusions — one says "30% ROI is fine, the rank is solid," the other says "I won't touch anything under 50% ROI in this category." Both can be right. The wrong move is to copy someone else's criteria without knowing why those numbers fit them.

Today you write your own one-page buy criteria sheet. Tape it above your desk. Every deal you analyze for the next 30 days, you measure against this sheet first. The criteria sheet is also a hedge against your own emotions — when you find a "great" deal, the sheet will tell you whether your gut is calibrated or excited.

What to actually write: (1) minimum ROI % — most beginners use 30%, some 50%; (2) minimum profit per unit in dollars — protects you from low-dollar deals where one return wipes the margin (usually $3-5 minimum); (3) maximum FBA sellers count — common range 3-10 depending on rank; (4) sales rank threshold for each main category you'll touch; (5) categories you flat-refuse to enter (groceries, supplements, anything with shelf life is a common starting "no"); (6) max buy cost per test order — usually $50-150 to limit risk per SKU; (7) any brands you flat-refuse to buy due to IP risk. One page. Honest numbers. Update quarterly.`,
  ),

  // ════════════════════════════════════════════════════════════════════════════
  // WEEK 4 — ACCOUNT HEALTH, OPERATIONS, SCALE
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
    `Welcome to Week 4. This is the most important non-Keepa skill in arbitrage: avoiding intellectual-property complaints. ONE IP complaint from a brand can suspend your account for weeks or permanently. You can have a perfect Keepa read on a deal and still get destroyed if the brand decides to enforce. Prevention is the entire game here — there's no good way to recover from a wave of complaints, only to avoid attracting them in the first place.

Things to watch for: (1) the categories of brands most likely to file claims — usually brands that don't sell on Amazon themselves, brands with active gating programs, and brands with a documented history of going after resellers; (2) how to research a brand BEFORE buying — search "[brand name] amazon reseller complaint," check seller forums like SAS or BSO, look for IP warnings in SellerAmp's panel; (3) the specific kinds of products that attract complaints — premium beauty, supplements, sunglasses, certain toy brands, anything with a "MAP" (Minimum Advertised Price) policy; and (4) what to do if you get hit — there's a specific response template and timing matters; you usually have 17 days to respond before automatic action. Start building your no-buy brand list TODAY. It only grows over time.`,
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
    `Most of the profitable products on Amazon are in "gated" brands or categories — meaning you need approval from Amazon before you can list them. Gating is a barrier to entry, which is GOOD for sellers who get past it (less competition, better margins) and BAD for sellers who don't (locked out of the best sourcing). This is the work that separates serious sellers from casual ones.

Getting ungated typically requires invoices from authorized distributors. This video walks through the actual process: what kinds of invoices Amazon accepts, how to find legitimate wholesale sources, what to do when you get denied (you will get denied at least once, that's normal).

Things to watch for: (1) the exact invoice requirements — Amazon usually wants a real wholesale invoice with the brand name, your business name matching your Seller Central account, a physical address, and a specific minimum unit count (often 10); (2) which wholesale directories actually have legit accounts — avoid scam "wholesale" sites that just resell retail at markup; (3) the application process inside Seller Central — exact screens, what to upload, what to write in the appeal section; (4) common rejection reasons — usually invoice quality, mismatched business name, or insufficient quantity. Pick one specific brand you'd love to sell and start the application process this week, even if you fail. Failure teaches you what they want.`,
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
    `Some brands and categories auto-ungate when you apply — no invoice needed, instant approval. Others auto-deny no matter what you submit. Knowing which is which saves hours of paperwork. This video walks through the auto-ungate strategy and what to do when you hit a denial.

The auto-ungate path is particularly valuable for sellers with clean account health and an established Amazon track record — Amazon's algorithm uses both as signals. Apply for everything on your wishlist; the worst case is a denial that takes 30 seconds, the best case is instant approval that unlocks dozens of profitable products.

Things to watch for: (1) which categories are commonly auto-ungated — often Toys around Q3-Q4 for sellers with clean account health, and certain Beauty subcategories at random times; (2) the timing — auto-ungate paths sometimes open and close based on Amazon's internal policies; what was instant approval in February may require an invoice in October; (3) how to interpret different denial messages — some are "try again with better paperwork," some are permanent until you have an established track record; (4) the workaround sequence when one path denies you — sometimes the same brand can be approved through a different category, or via a Sales Tax Exemption upload trick that some sellers use. Try auto-ungating 3 brands this week just to see what the process actually looks like end-to-end.`,
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
    `Bad prep equals damaged inventory equals refunds equals destroyed margin. Amazon is also discontinuing its US prep service for many sellers in 2026, which means more of us need to prep ourselves or pay a 3PL. Today is the practical day: learn the rules, buy the supplies, set up your workspace.

What to actually do: read MyFBAPrep's 2025 prep guide AND Amazon's official packaging requirements page (sellercentral.amazon.com/help). Then order the basic prep kit: a thermal label printer (Rollo or Dymo, around $140 used or $200 new — do NOT print labels on regular paper for FBA), 1.5mil poly bags with the suffocation warning pre-printed (Amazon requires this exact thickness and exact wording), bubble wrap on a roll, packing tape, and a small scale for weight verification. Total startup cost is around $250-300 and pays for itself within your first 30-50 units.

Things to remember: (1) the 1.5mil bag minimum — anything thinner and Amazon may reject the entire shipment; (2) the suffocation warning text must be visible and in the right font size (5/16" minimum height); (3) the 3-foot drop test for fragile items — if it can't survive a 3-foot drop, it needs more padding; and (4) any item over 1 lb needs a barcode label on the OUTSIDE of the prep, not on the original product packaging where it can be confused with the manufacturer's barcode.`,
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
    `Inventory mismanagement kills more small sellers than bad sourcing does. The two failure modes are equally deadly: you stock out and lose the buy box (which crashes your rank and can take weeks to recover), or you overstock and your cash sits frozen on Amazon's shelves while storage fees nibble away at margin. The middle path is a disciplined restock cycle, and this video walks through it.

The restock decision cycle: which products to reorder, how much, when. Easy to describe, hard to execute when you have 30+ SKUs and weekly cash flow constraints.

Things to watch for: (1) the reorder-point formula — usually based on your sell-through rate and Amazon's average inbound time (typically 7-14 days); (2) how he handles seasonal swings — Q4 reorder logic is very different from Q1 logic; in October you want to overweight stocks, in February you want to lighten them; (3) the FBA shipment creation process — what to include in one shipment vs. split across two for cost optimization; and (4) the inventory dashboards he uses — Amazon's built-in is workable, but tools like InventoryLab or RestockPro pay off above 20-30 SKUs. Even if you have zero active inventory today, build your restock template now — you'll need it the day after your first shipment hits FBA, not a week later.`,
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
    `Tactical Arbitrage (TA) is an OA scanning tool that runs scans across hundreds of retailer sites and surfaces likely buys for you. It costs $89-$129/month depending on the plan, which is real money — but at scale it can save 10-30 hours per week of manual sourcing.

Don't subscribe yet. Watch this video FIRST to understand what TA actually does and what it doesn't. The tool has a reputation for either being magical or being useless depending on the user, and the difference is almost entirely about setup quality and post-scan workflow. Then decide WHEN (not if) it's worth it for you.

Things to watch for: (1) what TA actually outputs — it's not a "list of guaranteed buys," it's a list of candidates you still have to verify with Keepa and SellerAmp; the verification step doesn't go away; (2) the scan configuration — what filters to set, which retailers to include, what categories to include or exclude; bad configuration produces thousands of junk results; (3) the realistic time savings — how many manual hours does an overnight TA scan replace; (4) the break-even point — at what monthly profit does the $89-129 subscription pay for itself? Most sellers find it pays off around $1,500-2,000 monthly profit. Below that, do it manually and use the savings to build capital.`,
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
    `You've spent 27 days learning. Today you commit capital. This is the gap that swallows most learners — they keep refining their analysis forever and never click buy. The product doesn't have to be amazing. What matters is crossing the threshold from analyst to seller.

The exact same product, analyzed by you on Day 28 vs. Day 1, would have looked completely different. You have the eye now. Trust it. Worst case, you lose $50 and learn an operational lesson that's worth more than the loss.

What to actually do: pick ONE product from your Day 20 sourcing list — ideally one with high confidence: positive Keepa pattern, SellerAmp green checks, brand that's not gated and not IP-risky, no obvious complications. Buy 3-5 units. Total spend under $100 to bound your risk.

Document every step: order confirmation, when it arrives, prep time, shipment label creation, time to be live on Amazon. Time everything. The point of a test buy isn't profit (you might break even or even lose a little on the first one) — it's learning the OPERATIONAL loop end-to-end. Once you've done it once, doing it ten times is trivial. Most sellers say their first 3-5 buys are educational expenses, not profitable trades. That's fine.`,
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
    `You don't need an LLC to start. You don't need a fancy accounting setup. But once you cross certain dollar thresholds, the IRS finds out about you via 1099-K reporting, and you need to be ready. As of 2026 that threshold is $600 in payment processor activity — much lower than the older $20K threshold. If you're going to make any real money this year, you'll cross it. Today is paperwork day. It's boring and necessary, and doing it early saves a lot of late-March panic.

What to actually do: (1) Open a separate bank account JUST for arbitrage — free at most banks like Chase, BoA, or any local credit union. Even if you stay a sole proprietor, separation prevents bookkeeping chaos and makes tax time vastly easier. (2) Apply for an EIN online at IRS.gov — free, takes 5 minutes; you'll use this instead of your SSN on most forms. (3) Decide on LLC vs. sole prop — under ~$30k/year of profit, sole prop is usually fine; above that, an LLC has tax advantages worth the $100-300 state filing fee. (4) Understand sales tax nexus — Amazon collects in most states now via Marketplace Facilitator laws, but check your home state for local registration requirements. (5) Set up a simple bookkeeping habit — even a Google Sheet with date, retailer, cost, sell price, fees is enough to start. Upgrade to QuickBooks or Wave when you have 50+ transactions per month.`,
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
    `30 days of learning is a foundation, not a finished house. The next 90 days decide whether you become a seller or stay a perpetual student. Today is the planning day: honest self-assessment, weak-spot identification, and a one-page 90-day plan you can actually execute.

The most common post-Day-30 trap: going back to watching more YouTube instead of doing reps. The next 90 days, your ratio should be roughly 1 hour of learning for every 10 hours of doing. If you find yourself watching another beginner video at week 6, that's a signal you're avoiding action — diagnose why.

What to actually do: write a one-page plan covering — (1) monthly profit goal for month 1, 2, 3 (start small, e.g., $200 / $500 / $1000); (2) hours per week you can realistically commit, not aspirationally; (3) sourcing target: how many products you'll analyze per week and how many you'll buy; (4) your weakest skill from Weeks 1-4 — pick ONE to deepen this quarter; (5) one tool to subscribe to in month 2 or 3 (or explicitly: none yet); (6) the single metric you'll track weekly that tells you if you're on track. Pin the page above your desk. Review it every Sunday for 12 weeks. At the end of 90 days you'll either have crushed the plan, missed it, or learned why the plan was wrong — all three outcomes are useful.`,
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
    `This is interview-style content with multiple successful sellers. The value isn't any single piece of advice — it's the patterns you see repeated across sellers who don't know each other. When 5 independent sellers all say "the most important thing is X," that's signal worth listening to. When they disagree, that's also information — it tells you the right answer depends on personal style or situation.

Things to watch for: (1) the pieces of advice that appear in multiple interviews — those are the universal truths, write each one down; (2) the disagreements — where sellers contradict each other tells you the strategy depends on your specific style, capital, or risk tolerance; (3) what each seller wishes they'd known on day one — this is gold because they're describing the gap between their current self and their day-one self; and (4) the specific mistakes each one regrets — they're often the same 3-4 mistakes you've already heard about in earlier days of this curriculum, which means those mistakes really are the dangerous ones, not just popular video topics. If you see the same regret three times, take it seriously.`,
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
    `If you've decided to subscribe to Tactical Arbitrage, this is the fastest way to get productive with it. TA has a steep learning curve — first scans often return zero results because the filters are too tight, or thousands of garbage results because the filters are too loose. The difference between a productive TA workflow and a wasted subscription is almost entirely about filter setup and post-scan workflow.

Things to watch for: (1) the initial filter setup — what to set on day one, especially minimum ROI, minimum profit, sales rank threshold, and offer count limits; (2) the retailer mix — which retailer scans are worth your time vs. which return mostly junk for your specific niche; not every TA-supported retailer is worth scanning; (3) the scheduling — how to set scans to run overnight so candidates are waiting in your queue every morning when you sit down to verify; (4) the post-scan workflow — once TA gives you 50 candidates, how do you triage them down to the 3-5 worth deeper analysis? That triage step is the actual skill, and it's barely covered in most tutorials. The faster you build a tight post-scan workflow, the more value you extract per dollar of subscription.`,
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
    `Inventory chaos typically hits sellers around month 3-6 — you have enough SKUs that you can't track them in your head anymore, but not enough that a full ERP system is justified. The "messy middle" kills profitability if you don't get a system, and the symptoms are subtle: stockouts you didn't anticipate, slow-movers you forgot you had, returns that sit unprocessed, storage fees that pile up. Each of those individually is small. Together they wipe a month's profit.

Things to watch for: (1) the specific spreadsheet template or tool he recommends — most working systems are simpler than you'd expect; (2) the reorder cadence — daily, weekly, or event-triggered — and what data point triggers a reorder vs. waiting (units left? days of cover? sales velocity drop?); (3) how to handle slow-moving inventory — the difference between cutting losses and waiting it out is one of the highest-stakes calls you make monthly; (4) the FBA storage fee danger — items that sit too long get hit with long-term storage fees, which can wipe a year's margin on that SKU. Build your inventory system BEFORE you need it, not after the first chaotic Q4.`,
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
    `Concrete product examples are worth ten abstract lectures. This video shows actual products with actual numbers — buy price, sell price, profit, ROI, sourcing site, the specific Keepa pattern that made it a buy. After 30 days of frameworks and rules, you need to see the rules applied to real ASINs to fully calibrate.

Things to watch for: (1) the categories the 5 products come from — note the pattern; most profitable OA arbitrage clusters in a few specific category types (kitchen, beauty consumables, niche hobby, small home hardware) — pay attention to which ones show up; (2) the source retailers — which ones reliably produce winners in this video? Probably a mix of mid-tier sites you don't shop at personally; (3) the price points — most beginner-friendly arbitrage products are $15-30 sell price, low enough to test cheaply but high enough to clear FBA fees comfortably; (4) for each product, ask yourself: "would I have bought this?" If your answer is no but the seller's was yes, dig into why — what did they see that you missed? If your answer is yes when theirs was no, also dig in. That gap is your remaining calibration error.`,
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
    `Live in-store footage is rare and valuable. Most retail arbitrage tutorials are talking-head; this one is shoulder-cam — actual aisles, actual phone-app scanning, actual decision-making in real time. The body language and scanning rhythm of an experienced RA sourcer is impossible to learn from a script; you have to watch it.

Things to watch for: (1) the aisles he prioritizes — most experienced RA sourcers have a "hot zones" route through a store; they hit clearance endcaps, then specific categories, then move on; they don't browse like a shopper; (2) the speed — how many seconds per product before he moves on; usually under 5 for obvious skips and 15-20 for maybes; (3) the products he picks up, scans, and PUTS DOWN — the rejects are as instructive as the buys because they teach you what experienced sellers DON'T waste time on; (4) any heuristics he verbalizes about clearance tags — Walmart's clearance system has secret codes (the famous "ends in $0.00 vs $0.07" rule for example) that experienced RA folks use to find deeper discounts. Steal anything you can.`,
    true,
  ),
];
