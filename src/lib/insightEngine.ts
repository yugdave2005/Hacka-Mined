// BurnSight Founder Insight Engine
// Uses OpenAI GPT-4o-mini to generate structured financial insights

import { Anomaly } from './anomalyDetector';

export interface InsightInput {
  burnRate: number;
  runway: number;
  revenueTrend: number[];
  expenseTrend: number[];
  anomalies: Anomaly[];
  riskScore: number;
  cashBalance: number;
}

export interface Insight {
  title: string;
  explanation: string;
  recommendation: string;
  impactEstimate: string;
}

export interface InsightOutput {
  insights: Insight[];
}

const SYSTEM_PROMPT = `You are a financial analyst for startups. You analyze financial data and provide actionable insights.

You MUST respond with ONLY a valid JSON object in this exact format:
{
  "insights": [
    {
      "title": "Brief insight title",
      "explanation": "Detailed explanation of the finding",
      "recommendation": "Specific actionable recommendation",
      "impactEstimate": "Estimated impact on runway or finances"
    }
  ]
}

Rules:
- Provide 3-5 insights
- Be specific with numbers
- Focus on actionable recommendations
- Each insight must have all four fields
- Do NOT add any text outside the JSON
- Do NOT use markdown formatting`;

function buildUserPrompt(input: InsightInput): string {
  const revenueTrendDirection = input.revenueTrend.length >= 2
    ? input.revenueTrend[input.revenueTrend.length - 1] > input.revenueTrend[0] ? 'growing' : 'declining'
    : 'insufficient data';

  const anomalySummary = input.anomalies.length > 0
    ? input.anomalies.map(a => `- ${a.title} (${a.severity}): ${a.impact}`).join('\n')
    : 'No anomalies detected';

  return `Analyze this startup's financial health and provide insights:

Financial Summary:
- Monthly Burn Rate: $${input.burnRate.toLocaleString()}
- Cash Runway: ${input.runway} months
- Cash Balance: $${input.cashBalance.toLocaleString()}
- Risk Score: ${input.riskScore}/100
- Revenue Trend: ${revenueTrendDirection}
- Recent Monthly Revenue: ${input.revenueTrend.slice(-3).map(r => '$' + r.toLocaleString()).join(', ')}
- Recent Monthly Expenses: ${input.expenseTrend.slice(-3).map(e => '$' + e.toLocaleString()).join(', ')}

Spending Anomalies:
${anomalySummary}

Provide actionable financial insights for the founder.`;
}

export async function generateInsights(input: InsightInput): Promise<InsightOutput> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    // Return mock insights when API key is not configured
    return generateMockInsights(input);
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
          { role: 'user', content: buildUserPrompt(input) },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, await response.text());
      return generateMockInsights(input);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return generateMockInsights(input);
    }

    const parsed = JSON.parse(content) as InsightOutput;

    // Validate structure
    if (!parsed.insights || !Array.isArray(parsed.insights)) {
      return generateMockInsights(input);
    }

    // Ensure each insight has required fields
    const validInsights = parsed.insights.filter(
      (i: Insight) => i.title && i.explanation && i.recommendation && i.impactEstimate
    );

    return { insights: validInsights.slice(0, 5) };
  } catch (error) {
    console.error('Insight generation error:', error);
    return generateMockInsights(input);
  }
}

function generateMockInsights(input: InsightInput): InsightOutput {
  const insights: Insight[] = [];

  // Runway-based insight
  if (input.runway < 6) {
    insights.push({
      title: 'Critical runway alert',
      explanation: `Your current runway of ${input.runway} months puts the company at significant risk. At the current burn rate of $${input.burnRate.toLocaleString()}/month, cash reserves will be depleted before Q${Math.ceil((new Date().getMonth() + input.runway) / 3)} ${new Date().getFullYear()}.`,
      recommendation: 'Immediately reduce non-essential spending by 20-30% and begin fundraising discussions within the next 2 weeks.',
      impactEstimate: `Cutting costs by 25% would extend runway by ${Math.round(input.runway * 0.33 * 10) / 10} months`,
    });
  } else if (input.runway < 12) {
    insights.push({
      title: 'Runway approaching caution zone',
      explanation: `With ${input.runway} months of runway, you have limited time to achieve key milestones before needing additional funding.`,
      recommendation: 'Start fundraising preparation now. Review all discretionary spending categories for potential 15% reduction.',
      impactEstimate: `Proactive cost management could extend runway to ${Math.round(input.runway * 1.15 * 10) / 10} months`,
    });
  }

  // Burn trend insight
  if (input.expenseTrend.length >= 3) {
    const recent = input.expenseTrend.slice(-3);
    const older = input.expenseTrend.slice(-6, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (change > 10) {
        insights.push({
          title: 'Accelerating burn rate detected',
          explanation: `Monthly expenses increased by ${Math.round(change)}% in the last quarter compared to the prior period, from $${Math.round(olderAvg).toLocaleString()} to $${Math.round(recentAvg).toLocaleString()}/month.`,
          recommendation: 'Audit recent expense increases. Identify top 3 growing cost categories and evaluate ROI for each.',
          impactEstimate: `Reversing the increase would save $${Math.round(recentAvg - olderAvg).toLocaleString()}/month`,
        });
      }
    }
  }

  // Anomaly-based insights
  for (const anomaly of input.anomalies.slice(0, 2)) {
    insights.push({
      title: anomaly.title,
      explanation: `${anomaly.category.replace(/_/g, ' ')} spending is ${anomaly.deviationMultiple}x standard deviations above the 6-month average ($${anomaly.currentAmount.toLocaleString()} vs $${anomaly.historicalMean.toLocaleString()} avg).`,
      recommendation: `Review all ${anomaly.category.replace(/_/g, ' ').toLowerCase()} charges this month and negotiate terms or switch providers if possible.`,
      impactEstimate: anomaly.impact,
    });
  }

  // Revenue insight
  if (input.revenueTrend.length >= 2) {
    const lastRev = input.revenueTrend[input.revenueTrend.length - 1];
    const prevRev = input.revenueTrend[input.revenueTrend.length - 2];
    if (lastRev > 0 && prevRev > 0) {
      const growth = ((lastRev - prevRev) / prevRev) * 100;
      insights.push({
        title: growth > 0 ? 'Revenue momentum building' : 'Revenue growth stalling',
        explanation: `Month-over-month revenue ${growth > 0 ? 'grew' : 'declined'} by ${Math.abs(Math.round(growth))}%, from $${prevRev.toLocaleString()} to $${lastRev.toLocaleString()}.`,
        recommendation: growth > 0
          ? 'Double down on current acquisition channels. Consider increasing marketing budget by 10-15% to capitalize on momentum.'
          : 'Analyze churn rates and customer feedback. Focus on retention before increasing acquisition spend.',
        impactEstimate: growth > 0
          ? `Maintaining this growth rate doubles revenue in ${Math.round(72 / Math.max(growth, 1))} months`
          : `Reversing the decline could add $${Math.abs(Math.round(lastRev - prevRev)).toLocaleString()}/month to revenue`,
      });
    }
  }

  // Always provide at least one insight
  if (insights.length === 0) {
    insights.push({
      title: 'Financial data analysis complete',
      explanation: `Your startup has $${input.cashBalance.toLocaleString()} in cash with a burn rate of $${input.burnRate.toLocaleString()}/month, providing ${input.runway} months of runway.`,
      recommendation: 'Continue monitoring burn rate and focus on revenue growth to extend runway.',
      impactEstimate: 'A 10% reduction in burn rate would add approximately 1 month of runway',
    });
  }

  return { insights: insights.slice(0, 5) };
}
