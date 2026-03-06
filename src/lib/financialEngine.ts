// BurnSight Financial Intelligence Engine
// Computes core financial metrics from transaction data

export interface Transaction {
  id: string;
  date: string | Date;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
}

export interface MonthlyData {
  month: string; // YYYY-MM
  revenue: number;
  expenses: number;
  netBurn: number;
}

export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  netBurn: number;
  runway: number;
  burnTrend: number[];
  cashVelocity: number;
  monthlyData: MonthlyData[];
  avgMonthlyRevenue: number;
  avgMonthlyExpenses: number;
}

function groupByMonth(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }
  return groups;
}

export function calculateMonthlyRevenue(transactions: Transaction[]): Map<string, number> {
  const monthly = new Map<string, number>();
  const groups = groupByMonth(transactions.filter(t => t.type === 'INCOME'));
  for (const [month, txs] of groups) {
    monthly.set(month, txs.reduce((sum, t) => sum + Math.abs(t.amount), 0));
  }
  return monthly;
}

export function calculateMonthlyExpenses(transactions: Transaction[]): Map<string, number> {
  const monthly = new Map<string, number>();
  const groups = groupByMonth(transactions.filter(t => t.type === 'EXPENSE'));
  for (const [month, txs] of groups) {
    monthly.set(month, txs.reduce((sum, t) => sum + Math.abs(t.amount), 0));
  }
  return monthly;
}

export function calculateNetBurn(revenue: number, expenses: number): number {
  return expenses - revenue;
}

export function calculateRunway(cashBalance: number, monthlyBurn: number): number {
  if (monthlyBurn <= 0) return 999; // Net positive = infinite runway
  return Math.round((cashBalance / monthlyBurn) * 10) / 10;
}

export function calculateCashVelocity(burnTrend: number[]): number {
  if (burnTrend.length < 2) return 0;

  // Linear regression slope of burn over recent months
  const n = burnTrend.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += burnTrend[i];
    sumXY += i * burnTrend[i];
    sumX2 += i * i;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return Math.round(slope * 100) / 100;
}

export function computeFinancialMetrics(
  transactions: Transaction[],
  cashBalance: number
): FinancialMetrics {
  const revenueByMonth = calculateMonthlyRevenue(transactions);
  const expensesByMonth = calculateMonthlyExpenses(transactions);

  // Get all unique months sorted
  const allMonths = new Set([...revenueByMonth.keys(), ...expensesByMonth.keys()]);
  const sortedMonths = Array.from(allMonths).sort();

  // Build monthly data
  const monthlyData: MonthlyData[] = sortedMonths.map(month => {
    const rev = revenueByMonth.get(month) || 0;
    const exp = expensesByMonth.get(month) || 0;
    return {
      month,
      revenue: rev,
      expenses: exp,
      netBurn: exp - rev,
    };
  });

  // Compute aggregates (use last 6 months or all available)
  const recentMonths = monthlyData.slice(-6);
  const totalRevenue = recentMonths.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = recentMonths.reduce((s, m) => s + m.expenses, 0);
  const avgRevenue = recentMonths.length > 0 ? totalRevenue / recentMonths.length : 0;
  const avgExpenses = recentMonths.length > 0 ? totalExpenses / recentMonths.length : 0;
  const netBurn = calculateNetBurn(avgRevenue, avgExpenses);

  // Burn trend (last 6 months net burn values)
  const burnTrend = recentMonths.map(m => m.netBurn);
  const cashVelocity = calculateCashVelocity(burnTrend);

  // Runway
  const runway = calculateRunway(cashBalance, netBurn);

  return {
    revenue: Math.round(avgRevenue * 100) / 100,
    expenses: Math.round(avgExpenses * 100) / 100,
    netBurn: Math.round(netBurn * 100) / 100,
    runway,
    burnTrend,
    cashVelocity,
    monthlyData,
    avgMonthlyRevenue: Math.round(avgRevenue * 100) / 100,
    avgMonthlyExpenses: Math.round(avgExpenses * 100) / 100,
  };
}
