"use client";
import React, { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, TrendingUp, AlertTriangle, BookOpen, Target, Zap, Brain } from "lucide-react";

interface CoachAnalysis {
  skillLevel: string;
  strengths: string[];
  weaknesses: string[];
  topMistakes: string[];
  nextFocus: string;
  weeklyPlan: string;
  practiceTask: string;
  rawResponse?: string;
}

export default function AiCoachPage() {
  const { videos, notes, keepaEntries, productAnalyses, skills, flashcards, weeklyPlans } = useStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askResponse, setAskResponse] = useState("");

  const summary = useMemo(() => {
    const masteredSkills = skills.filter(s => s.status === "mastered").map(s => s.skillName);
    const learningSkills = skills.filter(s => s.status === "learning" || s.status === "practicing").map(s => s.skillName);
    const notStartedSkills = skills.filter(s => s.status === "not_started").map(s => s.skillName);
    const videosCompleted = videos.filter(v => v.status === "completed").length;
    const keepaAccuracy = keepaEntries.length > 0
      ? Math.round((keepaEntries.filter(k => k.myDecision === k.correctDecision).length / keepaEntries.length) * 100)
      : 0;
    const topMistakes = keepaEntries
      .flatMap(k => k.mistakes)
      .reduce((acc, m) => { acc[m] = (acc[m] || 0) + 1; return acc; }, {} as Record<string, number>);
    const sortedMistakes = Object.entries(topMistakes).sort(([, a], [, b]) => b - a).slice(0, 5).map(([m]) => m);
    const avgROI = productAnalyses.length > 0
      ? productAnalyses.reduce((s, p) => s + p.roi, 0) / productAnalyses.length
      : 0;
    return {
      masteredSkills, learningSkills, notStartedSkills, videosCompleted,
      keepaAccuracy, sortedMistakes, avgROI: avgROI.toFixed(1),
      totalNotes: notes.length, totalKeepa: keepaEntries.length, totalProducts: productAnalyses.length,
      knownFlashcards: flashcards.filter(f => f.status === "known").length, totalFlashcards: flashcards.length,
    };
  }, [videos, notes, keepaEntries, productAnalyses, skills, flashcards]);

  async function getAnalysis() {
    setLoading(true);
    setAnalysis(null);
    try {
      const prompt = buildAnalysisPrompt(summary);
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", data: { prompt } }),
      });
      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setAnalysis(buildLocalAnalysis(summary));
      }
    } catch {
      setAnalysis(buildLocalAnalysis(summary));
    } finally {
      setLoading(false);
    }
  }

  function buildAnalysisPrompt(s: typeof summary) {
    return `You are an expert Amazon FBA arbitrage coach. Analyze this learner's progress and give direct, specific coaching advice.

LEARNER DATA:
- Mastered skills: ${s.masteredSkills.slice(0, 5).join(", ") || "None yet"}
- Learning skills: ${s.learningSkills.slice(0, 5).join(", ") || "None yet"}
- Not started: ${s.notStartedSkills.length} skills
- Videos completed: ${s.videosCompleted}
- Notes taken: ${s.totalNotes}
- Keepa charts practiced: ${s.totalKeepa}
- Keepa accuracy: ${s.keepaAccuracy}%
- Products analyzed: ${s.totalProducts}
- Average ROI on analyzed products: ${s.avgROI}%
- Top mistakes: ${s.sortedMistakes.slice(0, 3).join(", ") || "No mistakes tracked yet"}
- Flashcards known: ${s.knownFlashcards}/${s.totalFlashcards}

Respond with a JSON object with this exact structure:
{
  "skillLevel": "string - one of: Complete Beginner, Beginner, Intermediate Beginner, Intermediate, Advanced Intermediate, Advanced",
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "topMistakes": ["string", "string"],
  "nextFocus": "string - one specific thing to work on this week",
  "weeklyPlan": "string - 2-3 sentences on what to study this week",
  "practiceTask": "string - one very specific practice task to do today"
}`;
  }

  function buildLocalAnalysis(s: typeof summary): CoachAnalysis {
    const totalActivity = s.totalKeepa + s.totalProducts + s.totalNotes + s.videosCompleted;
    let skillLevel = "Complete Beginner";
    if (s.masteredSkills.length >= 10) skillLevel = "Advanced";
    else if (s.masteredSkills.length >= 5) skillLevel = "Advanced Intermediate";
    else if (s.masteredSkills.length >= 2) skillLevel = "Intermediate";
    else if (totalActivity >= 10) skillLevel = "Intermediate Beginner";
    else if (totalActivity >= 3) skillLevel = "Beginner";

    const strengths = [];
    if (s.keepaAccuracy >= 70) strengths.push("Strong Keepa decision accuracy");
    if (s.videosCompleted >= 5) strengths.push("Consistent video learning");
    if (s.totalNotes >= 10) strengths.push("Good note-taking habit");
    if (s.totalKeepa >= 20) strengths.push("Dedicated Keepa practice");
    if (strengths.length === 0) strengths.push("You are starting your FBA learning journey", "Consistency will be your biggest advantage", "Focus on fundamentals first");

    const weaknesses = [];
    if (s.keepaAccuracy < 60 && s.totalKeepa > 0) weaknesses.push("Keepa chart reading accuracy needs improvement");
    if (s.totalKeepa < 10) weaknesses.push("Need more Keepa chart practice");
    if (s.totalProducts < 5) weaknesses.push("Need more product analysis practice");
    if (s.totalNotes < 5) weaknesses.push("Take more structured notes");
    if (weaknesses.length === 0) weaknesses.push("Keep maintaining your good momentum", "Push for mastery in advanced topics");

    const topMistakes = s.sortedMistakes.length > 0
      ? s.sortedMistakes.slice(0, 2)
      : ["Not tracking enough Keepa data points", "Need to practice more product analyses"];

    return {
      skillLevel,
      strengths,
      weaknesses,
      topMistakes,
      nextFocus: s.totalKeepa < 20 ? "Practice 10 Keepa charts focusing on 90-day average and seller count" : "Deepen your product analysis skills by analyzing 5 products from scratch",
      weeklyPlan: s.totalKeepa < 20
        ? "This week: Watch 2 Keepa tutorial videos, practice 10 Keepa chart entries in your journal, and take detailed notes on what you miss. Focus exclusively on offer count and Amazon in-stock percentage."
        : "This week: Practice 5 complete product analyses from Keepa to final decision, track your mistakes, and review your top 3 missed signals from past entries.",
      practiceTask: `Find a product in Office Products, analyze its Keepa chart, fill in all data points in your Keepa Practice Journal, make a decision, then verify if you were correct.`,
    };
  }

  async function askQuestion() {
    if (!question.trim()) return;
    setAskLoading(true);
    setAskResponse("");
    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ask", data: { question, context: summary } }),
      });
      const data = await response.json();
      if (data.error) {
        setAskResponse(`API error: ${data.error}`);
      } else {
        setAskResponse(data.result || "Empty response from API.");
      }
    } catch (e) {
      setAskResponse(`Error calling AI service: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAskLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-3xl p-6 lg:p-8 animate-in">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600 via-pink-500 to-rose-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="relative text-white">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-widest uppercase opacity-90">AI Study Coach</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black">A coach that read everything you logged.</h1>
          <p className="text-white/85 max-w-xl mt-2 text-sm lg:text-base">
            Tells you what to focus on next based on your real progress — not generic advice.
          </p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-blue-600">{summary.videosCompleted}</p><p className="text-xs text-muted-foreground">Videos Done</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-green-600">{summary.totalKeepa}</p><p className="text-xs text-muted-foreground">Keepa Charts</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className={`text-xl font-bold ${summary.keepaAccuracy >= 70 ? "text-green-600" : "text-yellow-600"}`}>{summary.keepaAccuracy}%</p><p className="text-xs text-muted-foreground">Keepa Accuracy</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold text-purple-600">{summary.masteredSkills.length}</p><p className="text-xs text-muted-foreground">Skills Mastered</p></CardContent></Card>
      </div>

      {/* Get Analysis Button */}
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Bot className="h-12 w-12 text-blue-500 mx-auto" />
          <p className="text-muted-foreground">The AI Coach will analyze all your learning data and give you personalized recommendations.</p>
          <Button onClick={getAnalysis} disabled={loading} size="lg">
            <Zap className="h-4 w-4" />
            {loading ? "Analyzing your progress..." : "Get My AI Analysis"}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Skill Level */}
          <Card className="border-blue-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Skill Level</p>
                  <p className="text-2xl font-bold text-blue-600">{analysis.skillLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="border-green-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> What You Are Good At
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-red-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> What to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">!</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Top Mistakes */}
          {analysis.topMistakes.length > 0 && (
            <Card className="border-orange-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-orange-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Most Common Mistakes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {analysis.topMistakes.map((m, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <Badge variant="warning" className="text-xs">{i + 1}</Badge>
                      {m}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Next Focus */}
          <Card className="border-blue-300 bg-blue-50 dark:bg-blue-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                <Target className="h-4 w-4" /> Your Next Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{analysis.nextFocus}</p>
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-500" /> This Week's Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{analysis.weeklyPlan}</p>
            </CardContent>
          </Card>

          {/* Practice Task */}
          <Card className="border-green-300 bg-green-50 dark:bg-green-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-700 flex items-center gap-2">
                <Zap className="h-4 w-4" /> Do This Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">{analysis.practiceTask}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ask a Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-500" /> Ask Your AI Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask anything about Amazon FBA, Keepa, SellerAmp, product research..."
            rows={3}
          />
          <Button onClick={askQuestion} disabled={askLoading || !question.trim()}>
            {askLoading ? "Thinking..." : "Ask Question"}
          </Button>
          {askResponse && (
            <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">{askResponse}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
