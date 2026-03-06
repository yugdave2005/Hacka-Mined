// BurnSight Financial Anomaly Detection
// Detects abnormal spending patterns using statistical analysis

import { Transaction } from './financialEngine';

export interface Anomaly {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  impact: string;
  currentAmount: number;
  historicalMean: number;
  standardDeviation: number;
  deviationMultiple: number;
}

interface CategoryMonthly {
  category: string;
  monthlyAmounts: number[];
  currentMonth: number;
}

function getCategoryMonthlyData(transactions: Transaction[]): CategoryMonthly[] {
  // Group by category and month
  const categoryMonths = new Map<string, Map<string, number>>();

  for (const tx of transactions.filter(t => t.type === 'EXPENSE')) {
    const cat = tx.category;
    const d = new Date(tx.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!categoryMonths.has(cat)) categoryMonths.set(cat, new Map());
    const months = categoryMonths.get(cat)!;
    months.set(monthKey, (months.get(monthKey) || 0) + Math.abs(tx.amount));
  }

  const result: CategoryMonthly[] = [];

  for (const [category, months] of categoryMonths) {
    const sortedMonths = Array.from(months.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    if (sortedMonths.length < 2) continue;

    const allAmounts = sortedMonths.map(([, amt]) => amt);
    const currentMonth = allAmounts[allAmounts.length - 1];
    const historicalAmounts = allAmounts.slice(0, -1);

    result.push({
      category,
      monthlyAmounts: historicalAmounts,
      currentMonth,
    });
  }

  return result;
}

function computeMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function computeStdDev(values: number[], mean: number): number {
  if (values.length < 2) return 0;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function categorizeSeverity(deviationMultiple: number): Anomaly['severity'] {
  if (deviationMultiple >= 3) return 'CRITICAL';
  if (deviationMultiple >= 2.5) return 'HIGH';
  if (deviationMultiple >= 2) return 'MEDIUM';
  return 'LOW';
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

function estimateRunwayImpact(excessAmount: number, avgMonthlyBurn: number): string {
  if (avgMonthlyBurn <= 0) return 'Minimal impact';
  const monthsImpact = Math.round((excessAmount / avgMonthlyBurn) * 10) / 10;
  return `Runway reduced by ${monthsImpact} months`;
}

export function detectAnomalies(
  transactions: Transaction[],
  avgMonthlyBurn: number = 0
): Anomaly[] {
  const categoryData = getCategoryMonthlyData(transactions);
  const anomalies: Anomaly[] = [];

  for (const { category, monthlyAmounts, currentMonth } of categoryData) {
    const mean = computeMean(monthlyAmounts);
    const stddev = computeStdDev(monthlyAmounts, mean);

    // Skip if no variance (consistent spending)
    if (stddev === 0) continue;

    const threshold = mean + 2 * stddev;

    if (currentMonth > threshold) {
      const deviationMultiple = Math.round(((currentMonth - mean) / stddev) * 10) / 10;
      const excessAmount = currentMonth - mean;

      anomalies.push({
        category,
        severity: categorizeSeverity(deviationMultiple),
        title: `${formatCategoryName(category)} cost spike detected`,
        impact: estimateRunwayImpact(excessAmount, avgMonthlyBurn),
        currentAmount: Math.round(currentMonth * 100) / 100,
        historicalMean: Math.round(mean * 100) / 100,
        standardDeviation: Math.round(stddev * 100) / 100,
        deviationMultiple,
      });
    }
  }

  // Sort by severity (CRITICAL first)
  const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return anomalies;
}
