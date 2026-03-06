// BurnSight Anomaly Detection API Route
import { NextRequest, NextResponse } from 'next/server';
import { detectAnomalies } from '@/lib/anomalyDetector';
import { Transaction } from '@/lib/financialEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, avgMonthlyBurn } = body as {
      transactions: Transaction[];
      avgMonthlyBurn?: number;
    };

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'transactions array is required' },
        { status: 400 }
      );
    }

    const anomalies = detectAnomalies(transactions, avgMonthlyBurn || 0);

    return NextResponse.json({
      success: true,
      anomalies,
      count: anomalies.length,
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json(
      { error: 'Internal server error detecting anomalies' },
      { status: 500 }
    );
  }
}
