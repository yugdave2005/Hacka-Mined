// BurnSight Financial Engine API Route
import { NextRequest, NextResponse } from 'next/server';
import { computeFinancialMetrics, Transaction } from '@/lib/financialEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, cashBalance } = body as {
      transactions: Transaction[];
      cashBalance: number;
    };

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'transactions array is required' },
        { status: 400 }
      );
    }

    if (typeof cashBalance !== 'number' || isNaN(cashBalance)) {
      return NextResponse.json(
        { error: 'cashBalance must be a valid number' },
        { status: 400 }
      );
    }

    // Handle edge case: negative or zero cash balance
    const safeCashBalance = Math.max(cashBalance, 0);

    const metrics = computeFinancialMetrics(transactions, safeCashBalance);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Financial engine error:', error);
    return NextResponse.json(
      { error: 'Internal server error computing financial metrics' },
      { status: 500 }
    );
  }
}
