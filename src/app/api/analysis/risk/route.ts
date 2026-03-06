// BurnSight Risk Engine API Route
import { NextRequest, NextResponse } from 'next/server';
import { computeRiskScore, RiskInput } from '@/lib/riskEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runwayMonths, burnTrend, expenses, revenues } = body as RiskInput;

    if (typeof runwayMonths !== 'number') {
      return NextResponse.json(
        { error: 'runwayMonths is required and must be a number' },
        { status: 400 }
      );
    }

    // Handle edge cases
    const safeInput: RiskInput = {
      runwayMonths: Math.max(runwayMonths, 0),
      burnTrend: Array.isArray(burnTrend) ? burnTrend : [],
      expenses: Array.isArray(expenses) ? expenses : [],
      revenues: Array.isArray(revenues) ? revenues : [],
    };

    const risk = computeRiskScore(safeInput);

    return NextResponse.json({
      success: true,
      risk,
    });
  } catch (error) {
    console.error('Risk engine error:', error);
    return NextResponse.json(
      { error: 'Internal server error computing risk score' },
      { status: 500 }
    );
  }
}
