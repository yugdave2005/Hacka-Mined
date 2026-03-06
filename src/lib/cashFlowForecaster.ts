// BurnSight Cash Flow Forecaster
// Projects 12 months forward with best/base/worst scenarios
// Calculates exact cash-zero date and fundraising deadline

export interface CashFlowForecast {
    months: string[];
    bestCase: number[];
    baseCase: number[];
    worstCase: number[];
    cashZeroDate: string | null;
    monthsToProfitability: number | null;
    fundraisingDeadline: string | null;
    revenueGrowthRate: number;
}

interface MonthlyRow {
    month: string;
    revenue: number;
    expenses: number;
    netBurn: number;
}

function getMonthLabel(date: Date): string {
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function computeGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    if (first <= 0) return last > 0 ? 0.1 : 0;
    const periods = values.length - 1;
    return Math.pow(last / first, 1 / periods) - 1;
}

export function forecastCashFlow(
    monthlyBreakdown: MonthlyRow[],
    cashBalance: number,
    monthlyBurnRate: number,
    monthlyRevenue: number
): CashFlowForecast {
    const recentMonths = monthlyBreakdown.slice(-6);

    // Compute historical growth rates
    const revenues = recentMonths.map(m => m.revenue);
    const expenses = recentMonths.map(m => m.expenses);

    const revGrowthRate = computeGrowthRate(revenues);
    const expGrowthRate = computeGrowthRate(expenses);

    const lastRevenue = revenues.length > 0 ? revenues[revenues.length - 1] : monthlyRevenue;
    const lastExpense = expenses.length > 0 ? expenses[expenses.length - 1] : monthlyRevenue + monthlyBurnRate;

    // Determine projection start date
    let startDate: Date;
    if (recentMonths.length > 0) {
        const lastMonth = recentMonths[recentMonths.length - 1].month;
        // Try to parse "Feb 2026" or "2026-02" format
        const parsed = new Date(lastMonth + ' 1');
        if (!isNaN(parsed.getTime())) {
            startDate = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 1);
        } else {
            // Try YYYY-MM format
            const parts = lastMonth.split('-');
            if (parts.length === 2) {
                startDate = new Date(parseInt(parts[0]), parseInt(parts[1]), 1);
            } else {
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() + 1);
                startDate.setDate(1);
            }
        }
    } else {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1);
        startDate.setDate(1);
    }

    const projectionMonths = 12;
    const months: string[] = [];

    // Scenario parameters
    // Best: expenses flat, revenue grows at max(historical, 5%)
    const bestRevGrowth = Math.max(revGrowthRate, 0.05);
    const bestExpGrowth = 0;

    // Base: both follow current trends
    const baseRevGrowth = revGrowthRate;
    const baseExpGrowth = Math.max(expGrowthRate, 0);

    // Worst: expenses grow 10% faster, revenue stalls
    const worstRevGrowth = Math.min(revGrowthRate * 0.3, 0);
    const worstExpGrowth = Math.max(expGrowthRate, 0) + 0.02;

    const bestCase: number[] = [];
    const baseCase: number[] = [];
    const worstCase: number[] = [];

    let bestCash = cashBalance;
    let baseCash = cashBalance;
    let worstCash = cashBalance;

    let bestRev = lastRevenue;
    let baseRev = lastRevenue;
    let worstRev = lastRevenue;

    let bestExp = lastExpense;
    let baseExp = lastExpense;
    let worstExp = lastExpense;

    let cashZeroDate: string | null = null;
    let monthsToProfitability: number | null = null;

    for (let i = 0; i < projectionMonths; i++) {
        const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        months.push(getMonthLabel(monthDate));

        // Project forward
        bestRev *= (1 + bestRevGrowth);
        baseRev *= (1 + baseRevGrowth);
        worstRev *= (1 + worstRevGrowth);

        bestExp *= (1 + bestExpGrowth);
        baseExp *= (1 + baseExpGrowth);
        worstExp *= (1 + worstExpGrowth);

        bestCash -= (bestExp - bestRev);
        baseCash -= (baseExp - baseRev);
        worstCash -= (worstExp - worstRev);

        bestCase.push(Math.round(bestCash));
        baseCase.push(Math.round(baseCash));
        worstCase.push(Math.round(worstCash));

        // Track cash-zero date (base case)
        if (!cashZeroDate && baseCash <= 0) {
            cashZeroDate = getMonthLabel(monthDate);
        }

        // Track profitability (base case)
        if (monthsToProfitability === null && baseRev >= baseExp) {
            monthsToProfitability = i + 1;
        }
    }

    // Fundraising deadline = cash-zero date minus 6 months
    let fundraisingDeadline: string | null = null;
    if (cashZeroDate) {
        // Find the index of cash-zero month
        const zeroIdx = months.indexOf(cashZeroDate);
        if (zeroIdx >= 6) {
            fundraisingDeadline = months[zeroIdx - 6];
        } else if (zeroIdx >= 0) {
            fundraisingDeadline = 'IMMEDIATELY — less than 6 months before cash-zero';
        }
    }

    return {
        months,
        bestCase,
        baseCase,
        worstCase,
        cashZeroDate,
        monthsToProfitability,
        fundraisingDeadline,
        revenueGrowthRate: Math.round(revGrowthRate * 1000) / 10,
    };
}
