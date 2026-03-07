// BurnSight Consolidated Analysis API Route
// Receives parsed transaction data → calls OpenAI with structured outputs → returns full analysis
import { NextRequest, NextResponse } from 'next/server';
import { computeFounderMetrics } from '@/lib/founderMetricsEngine';
import { forecastCashFlow } from '@/lib/cashFlowForecaster';

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

const SYSTEM_PROMPT = `You are a world-class startup CFO and financial analyst. You receive raw bank/Stripe transactions and must analyze them to assess the startup's financial health.

You MUST respond with ONLY a valid JSON object matching this exact schema:

{
  "currentRunwayMonths": <number - estimated months of cash remaining>,
  "monthlyBurnRate": <number - average monthly net cash outflow>,
  "monthlyRevenue": <number - average monthly revenue/income>,
  "cashBalance": <number - estimated current cash based on transactions>,
  "riskLevel": <"SAFE" | "WARNING" | "CRITICAL">,
  "riskScore": <number 0-100, where 100 is highest risk>,
  "topExpenseCategories": [
    {
      "category": "<string>",
      "amount": <number - monthly average>,
      "percentOfTotal": <number>,
      "trend": <"increasing" | "decreasing" | "stable">
    }
  ],
  "criticalZombieSpend": "<string describing the most wasteful or suspicious recurring expense that should be cut immediately, or 'No zombie spend detected' if none found>",
  "monthlyBreakdown": [
    {
      "month": "<string e.g. 'Feb 2026'>",
      "revenue": <number>,
      "expenses": <number>,
      "netBurn": <number>
    }
  ],
  "aiInsights": [
    {
      "title": "<brief title>",
      "explanation": "<detailed analysis>",
      "recommendation": "<specific actionable advice>",
      "impactEstimate": "<estimated financial impact>"
    }
  ],
  "signals": [
    {
      "text": "<brief alert description>",
      "type": <"positive" | "warning" | "neutral">,
      "time": "<relative time e.g. 'recent'>"
    }
  ]
}

Rules:
- Analyze ALL transactions to compute accurate totals
- Group transactions into clear expense categories (Payroll, Infrastructure, Marketing, Software, Office, etc.)
- Identify the single worst zombie spend (recurring cost delivering no clear value)
- Provide 3-5 founder-actionable insights
- Provide 3-4 financial signals
- Monthly breakdown should cover all months present in the data
- All numbers should be realistic and derived from the actual transaction data
- Risk score: 0-30 = SAFE, 31-60 = WARNING, 61-100 = CRITICAL
- Do NOT add any text outside the JSON`;

function buildPrompt(transactions: ParsedTransaction[], cashBalance?: number): string {
  const transactionSummary = transactions.slice(0, 500).map(t =>
    `${t.date} | ${t.type} | $${Math.abs(t.amount).toFixed(2)} | ${t.description}`
  ).join('\n');

  return `Analyze these ${transactions.length} startup bank/Stripe transactions and provide a complete financial health assessment.

${cashBalance ? `Current cash balance reported by founder: $${cashBalance.toLocaleString()}` : 'Cash balance not provided — estimate from transaction flow.'}

TRANSACTIONS:
${transactionSummary}
${transactions.length > 500 ? `\n... and ${transactions.length - 500} more transactions (totals should reflect all data)` : ''}

Provide your analysis as the structured JSON described in your instructions.`;
}

// Enriches any base analysis (AI or fallback) with founder metrics + cash flow forecast
function enrichWithFounderInsights(analysis: Record<string, unknown>): Record<string, unknown> {
  const monthlyRevenue = (analysis.monthlyRevenue as number) || 0;
  const monthlyBurnRate = (analysis.monthlyBurnRate as number) || 0;
  const cashBalance = (analysis.cashBalance as number) || 0;
  const topExpenseCategories = (analysis.topExpenseCategories as { category: string; amount: number; percentOfTotal: number; trend: string }[]) || [];
  const monthlyBreakdown = (analysis.monthlyBreakdown as { month: string; revenue: number; expenses: number; netBurn: number }[]) || [];

  // Compute founder metrics
  const founderMetrics = computeFounderMetrics(
    monthlyRevenue,
    monthlyBurnRate,
    cashBalance,
    topExpenseCategories,
    monthlyBreakdown
  );

  // Compute cash flow forecast
  const cashFlowForecast = forecastCashFlow(
    monthlyBreakdown,
    cashBalance,
    monthlyBurnRate,
    monthlyRevenue
  );

  // Revenue growth rate
  const revenueGrowthRate = cashFlowForecast.revenueGrowthRate;

  return {
    ...analysis,
    founderMetrics,
    cashFlowForecast,
    revenueGrowthRate,
  };
}

function generateFallbackAnalysis(transactions: ParsedTransaction[], cashBalance: number) {
  const income = transactions.filter(t => t.type === 'INCOME');
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  const totalRevenue = income.reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);

  // Group by month
  const months = new Map<string, { revenue: number; expenses: number }>();
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    const m = months.get(key) || { revenue: 0, expenses: 0 };
    if (t.type === 'INCOME') m.revenue += Math.abs(t.amount);
    else m.expenses += Math.abs(t.amount);
    months.set(key, m);
  }
  const monthCount = Math.max(months.size, 1);
  const avgRevenue = totalRevenue / monthCount;
  const avgExpenses = totalExpenses / monthCount;
  const netBurn = avgExpenses - avgRevenue;
  const runway = netBurn > 0 ? cashBalance / netBurn : 999;

  // Group expenses by category keywords
  const catMap = new Map<string, number>();
  for (const t of expenses) {
    const desc = t.description.toLowerCase();
    let cat = 'Other';
    if (/payroll|salary|wage|employee/i.test(desc)) cat = 'Payroll';
    else if (/aws|azure|gcp|hosting|server|cloud|heroku|vercel/i.test(desc)) cat = 'Infrastructure';
    else if (/marketing|ads|facebook|google ads|campaign|seo/i.test(desc)) cat = 'Marketing';
    else if (/software|saas|subscription|notion|slack|figma|github/i.test(desc)) cat = 'Software';
    else if (/office|rent|utilities|internet|phone/i.test(desc)) cat = 'Office';
    catMap.set(cat, (catMap.get(cat) || 0) + Math.abs(t.amount));
  }

  const topCategories = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, total]) => ({
      category,
      amount: Math.round(total / monthCount),
      percentOfTotal: Math.round((total / totalExpenses) * 100),
      trend: 'stable' as const,
    }));

  const riskScore = runway < 3 ? 85 : runway < 6 ? 65 : runway < 12 ? 40 : runway < 18 ? 20 : 10;
  const riskLevel = riskScore > 60 ? 'CRITICAL' as const : riskScore > 30 ? 'WARNING' as const : 'SAFE' as const;

  const monthlyBreakdown = [...months.entries()].map(([month, data]) => ({
    month,
    revenue: Math.round(data.revenue),
    expenses: Math.round(data.expenses),
    netBurn: Math.round(data.expenses - data.revenue),
  }));

  const baseAnalysis = {
    currentRunwayMonths: Math.round(runway * 10) / 10,
    monthlyBurnRate: Math.round(netBurn),
    monthlyRevenue: Math.round(avgRevenue),
    cashBalance,
    riskLevel,
    riskScore,
    topExpenseCategories: topCategories,
    criticalZombieSpend: 'Upload more data for zombie spend detection. Consider auditing recurring SaaS subscriptions.',
    monthlyBreakdown,
    aiInsights: [
      {
        title: `${runway < 12 ? 'Limited' : 'Healthy'} runway detected`,
        explanation: `Based on ${transactions.length} transactions across ${monthCount} months, your net burn is $${Math.round(netBurn).toLocaleString()}/month with $${cashBalance.toLocaleString()} in the bank.`,
        recommendation: runway < 6 ? 'Immediately reduce discretionary spending and begin fundraising.' : 'Continue monitoring burn rate and optimize top expense categories.',
        impactEstimate: `A 15% cost reduction would extend runway by ${Math.round(runway * 0.18)} months`,
      },
      {
        title: 'Expense category analysis',
        explanation: `Your top expense is ${topCategories[0]?.category || 'Unknown'} at ${topCategories[0]?.percentOfTotal || 0}% of total spend.`,
        recommendation: `Review ${topCategories[0]?.category || 'top'} costs for optimization opportunities.`,
        impactEstimate: `Reducing ${topCategories[0]?.category || 'top'} costs by 10% saves ~$${Math.round((topCategories[0]?.amount || 0) * 0.1).toLocaleString()}/month`,
      },
    ],
    signals: [
      { text: `${transactions.length} transactions analyzed across ${monthCount} months`, type: 'neutral' as const, time: 'just now' },
      { text: netBurn > 0 ? `Net burn: $${Math.round(netBurn).toLocaleString()}/mo` : 'Company is cash-flow positive!', type: netBurn > 0 ? 'warning' as const : 'positive' as const, time: 'recent' },
      { text: `Risk level: ${riskLevel}`, type: riskLevel === 'SAFE' ? 'positive' as const : 'warning' as const, time: 'recent' },
    ],
  };

  // Enrich with founder metrics + cash flow forecast
  return enrichWithFounderInsights(baseAnalysis);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, cashBalance = 0 } = body as { transactions: ParsedTransaction[]; cashBalance?: number };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Deterministic fallback when no API key
      const analysis = generateFallbackAnalysis(transactions, cashBalance);
      return NextResponse.json({ success: true, analysis, source: 'deterministic' });
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildPrompt(transactions, cashBalance) },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        console.error('Groq API error:', response.status);
        const analysis = generateFallbackAnalysis(transactions, cashBalance);
        return NextResponse.json({ success: true, analysis, source: 'deterministic-fallback' });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        const analysis = generateFallbackAnalysis(transactions, cashBalance);
        return NextResponse.json({ success: true, analysis, source: 'deterministic-fallback' });
      }

      const aiAnalysis = JSON.parse(content);

      // Validate essential fields exist
      if (typeof aiAnalysis.currentRunwayMonths !== 'number' || typeof aiAnalysis.monthlyBurnRate !== 'number') {
        const fallback = generateFallbackAnalysis(transactions, cashBalance);
        return NextResponse.json({ success: true, analysis: fallback, source: 'deterministic-fallback' });
      }

      // Always enrich AI response with computed founder metrics
      const analysis = enrichWithFounderInsights(aiAnalysis);
      return NextResponse.json({ success: true, analysis, source: 'ai' });
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      const analysis = generateFallbackAnalysis(transactions, cashBalance);
      return NextResponse.json({ success: true, analysis, source: 'deterministic-fallback' });
    }
  } catch (error) {
    console.error('Analyze statement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
