// BurnSight Session Store
// Manages transaction data in localStorage for pre-signup users

import { TransactionData, FinancialMetricsData, RiskData, AnomalyData, InsightData, AnalysisResult } from './types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'burnsight_transactions',
  CASH_BALANCE: 'burnsight_cash_balance',
  METRICS: 'burnsight_metrics',
  RISK: 'burnsight_risk',
  ANOMALIES: 'burnsight_anomalies',
  INSIGHTS: 'burnsight_insights',
  ANALYSIS: 'burnsight_analysis',
  HAS_DATA: 'burnsight_has_data',
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function saveTransactions(transactions: TransactionData[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_KEYS.HAS_DATA, 'true');
}

export function getTransactions(): TransactionData[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveCashBalance(balance: number): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.CASH_BALANCE, String(balance));
}

export function getCashBalance(): number {
  if (!isBrowser()) return 0;
  const val = localStorage.getItem(STORAGE_KEYS.CASH_BALANCE);
  return val ? parseFloat(val) : 0;
}

export function saveMetrics(metrics: FinancialMetricsData): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
}

export function getMetrics(): FinancialMetricsData | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(STORAGE_KEYS.METRICS);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveRisk(risk: RiskData): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.RISK, JSON.stringify(risk));
}

export function getRisk(): RiskData | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(STORAGE_KEYS.RISK);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveAnomalies(anomalies: AnomalyData[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.ANOMALIES, JSON.stringify(anomalies));
}

export function getAnomalies(): AnomalyData[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.ANOMALIES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveInsights(insights: InsightData[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
}

export function getInsights(): InsightData[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function hasSessionData(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(STORAGE_KEYS.HAS_DATA) === 'true';
}

export function saveAnalysis(analysis: AnalysisResult): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.ANALYSIS, JSON.stringify(analysis));
  localStorage.setItem(STORAGE_KEYS.HAS_DATA, 'true');
}

export function getAnalysis(): AnalysisResult | null {
  if (!isBrowser()) return null;
  const data = localStorage.getItem(STORAGE_KEYS.ANALYSIS);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearSessionData(): void {
  if (!isBrowser()) return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

export function getAllSessionData() {
  return {
    transactions: getTransactions(),
    cashBalance: getCashBalance(),
    metrics: getMetrics(),
    risk: getRisk(),
    anomalies: getAnomalies(),
    insights: getInsights(),
    analysis: getAnalysis(),
  };
}
