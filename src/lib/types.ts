// BurnSight Type Definitions

export interface FinancialState {
  cashBalance: number;
  transactions: TransactionData[];
  metrics: FinancialMetricsData | null;
  risk: RiskData | null;
  anomalies: AnomalyData[];
  insights: InsightData[];
}

export interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
}

export interface FinancialMetricsData {
  revenue: number;
  expenses: number;
  netBurn: number;
  runway: number;
  burnTrend: number[];
  cashVelocity: number;
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    netBurn: number;
  }[];
  avgMonthlyRevenue: number;
  avgMonthlyExpenses: number;
}

export interface RiskData {
  riskScore: number;
  riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  bankruptcyProbability90d: number;
  breakdown: {
    runwayRisk: number;
    burnTrendRisk: number;
    volatilityRisk: number;
    revenueRisk: number;
  };
}

export interface AnomalyData {
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  impact: string;
  currentAmount: number;
  historicalMean: number;
  standardDeviation: number;
  deviationMultiple: number;
}

export interface InsightData {
  title: string;
  explanation: string;
  recommendation: string;
  impactEstimate: string;
}

export interface SimulatorParams {
  hireEmployees: number;
  marketingBudget: number;
  revenueGrowthRate: number;
  fundraiseAmount: number;
}

export interface SimulatorResult {
  current: {
    burn: number;
    runway: number;
    riskScore: number;
  };
  projected: {
    burn: number;
    runway: number;
    riskScore: number;
  };
}

// ─── Founder-Grade Metrics ───

export interface CostCuttingItem {
  category: string;
  currentMonthly: number;
  potentialSaving: number;
  runwayImpactMonths: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface FounderMetricsData {
  grossMargin: number;
  opExRatio: number;
  revenuePerEmployee: number;
  estimatedHeadcount: number;
  payrollToRevenueRatio: number;
  isDefaultAlive: boolean;
  defaultAliveVerdict: string;
  costCuttingOpportunities: CostCuttingItem[];
}

export interface CashFlowForecastData {
  months: string[];
  bestCase: number[];
  baseCase: number[];
  worstCase: number[];
  cashZeroDate: string | null;
  monthsToProfitability: number | null;
  fundraisingDeadline: string | null;
  revenueGrowthRate: number;
}

// ─── Full Analysis Result ───

export interface AnalysisResult {
  currentRunwayMonths: number;
  monthlyBurnRate: number;
  monthlyRevenue: number;
  cashBalance: number;
  riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  riskScore: number;
  topExpenseCategories: {
    category: string;
    amount: number;
    percentOfTotal: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }[];
  criticalZombieSpend: string;
  monthlyBreakdown: {
    month: string;
    revenue: number;
    expenses: number;
    netBurn: number;
  }[];
  aiInsights: {
    title: string;
    explanation: string;
    recommendation: string;
    impactEstimate: string;
  }[];
  signals: {
    text: string;
    type: 'positive' | 'warning' | 'neutral';
    time: string;
  }[];
  // Deep founder metrics
  founderMetrics: FounderMetricsData;
  cashFlowForecast: CashFlowForecastData;
  revenueGrowthRate: number;
}

export type SubscriptionPlan = 'FREE' | 'PRO';
