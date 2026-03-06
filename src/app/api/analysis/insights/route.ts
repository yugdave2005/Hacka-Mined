// BurnSight AI Insights API Route
import { NextRequest, NextResponse } from 'next/server';
import { generateInsights, InsightInput } from '@/lib/insightEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      burnRate,
      runway,
      revenueTrend,
      expenseTrend,
      anomalies,
      riskScore,
      cashBalance,
    } = body as InsightInput;

    if (typeof burnRate !== 'number' || typeof runway !== 'number') {
      return NextResponse.json(
        { error: 'burnRate and runway are required numbers' },
        { status: 400 }
      );
    }

    const input: InsightInput = {
      burnRate,
      runway,
      revenueTrend: Array.isArray(revenueTrend) ? revenueTrend : [],
      expenseTrend: Array.isArray(expenseTrend) ? expenseTrend : [],
      anomalies: Array.isArray(anomalies) ? anomalies : [],
      riskScore: riskScore || 0,
      cashBalance: cashBalance || 0,
    };

    const result = await generateInsights(input);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Insight generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error generating insights' },
      { status: 500 }
    );
  }
}
