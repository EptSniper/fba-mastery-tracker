import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, data } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    if (action === "analyze") {
      return NextResponse.json({
        analysis: null,
        error: "ANTHROPIC_API_KEY not set — using local analysis instead",
      });
    }
    return NextResponse.json({ result: "AI features require ANTHROPIC_API_KEY to be set in your .env.local file. Add: ANTHROPIC_API_KEY=your_key_here" });
  }

  try {
    if (action === "analyze") {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{ role: "user", content: data.prompt }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ analysis });
      }
      return NextResponse.json({ analysis: null, raw: text });
    }

    if (action === "organize_notes") {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{
          role: "user",
          content: `You are an Amazon FBA learning coach. Organize these raw notes into a clear, structured format for learning. Extract the most important FBA-specific insights.

Raw notes:
${data.notes}

Organize into:
## Main Idea
(one sentence)

## Key Points
(bullet points of the most important information)

## How To Apply This
(practical application)

## Mistakes to Avoid
(common errors related to this topic)

## Action Steps
(specific things to do or practice)

Keep it concise and focused on Amazon FBA arbitrage.`,
        }],
      });
      const result = response.content[0].type === "text" ? response.content[0].text : "";
      return NextResponse.json({ result });
    }

    if (action === "ask") {
      const { question, context } = data;
      const systemPrompt = `You are an expert Amazon FBA arbitrage coach. You specialize in:
- Keepa chart reading and interpretation
- SellerAmp analysis
- Product research and sourcing
- Inventory management
- Risk assessment

The learner's current stats:
- Keepa accuracy: ${context.keepaAccuracy}%
- Charts practiced: ${context.totalKeepa}
- Products analyzed: ${context.totalProducts}
- Skills mastered: ${context.masteredSkills?.length || 0}

Give direct, practical advice. Focus on: boring profitable products (Office, Arts/Crafts, small tools, pet hardgoods), 30%+ ROI, 5-20 unit test buys, avoiding oversaturation.`;

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: question }],
      });
      const result = response.content[0].type === "text" ? response.content[0].text : "";
      return NextResponse.json({ result });
    }

    if (action === "analyze_video") {
      const { url, title } = data;
      const isYouTube = url?.includes("youtube.com") || url?.includes("youtu.be");
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `You are an Amazon FBA learning coach helping classify a resource for a curated study library.

Resource to classify:
Title: ${title || "(no title provided)"}
URL: ${url || "(no URL provided)"}
Is YouTube: ${isYouTube ? "Yes" : "No"}

WARNING: You cannot access the actual content of this URL. Base your analysis ONLY on the title and URL metadata. Mark estimating: true.

Respond with a JSON object:
{
  "category": "one of: Keepa Basics, Keepa Advanced, SellerAmp, Seller Assistant, Wholesale Price Sheet Analysis, SmartScout, Competitor Research, Amazon Seller University, Inventory Management, FBA Shipping, InventoryLab, Product Research, Risk Management, Sourcing Strategy",
  "difficulty": "beginner or intermediate or advanced",
  "sourceType": "YouTube Video, YouTube Playlist, YouTube Channel, Official Tool Page, Official Amazon Training, Official Amazon Help, Article, or Practice Day",
  "tags": ["array", "of", "relevant", "tags", "from: Keepa, Buy Box, Sales Rank, Rank Drops, Offer Count, FBA Sellers, Amazon In Stock, 90 Day Average, Price Tanking, SellerAmp, ROI, Profit, Max Cost, Restrictions, IP Risk, Wholesale, Supplier Sheets, Price List Analyzer, SmartScout, Competitors, Brands, Seller Map, Inventory, Restock, FBA Shipment, InventoryLab"],
  "whyIncluded": "one sentence why this belongs in an FBA learning library",
  "whatItTeaches": "one sentence what skill or concept this builds",
  "practiceTask": "one specific actionable practice task after watching/reading this",
  "estimating": true,
  "confidence": "low, medium, or high"
}`,
        }],
      });
      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json({ result: JSON.parse(jsonMatch[0]) });
      }
      return NextResponse.json({ result: null, raw: text });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
