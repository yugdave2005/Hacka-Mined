// BurnSight Mock Data Generator
// Provides realistic sample data for demo/development

import { TransactionData, FinancialMetricsData, RiskData, AnomalyData, InsightData } from './types';

function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function generateMockTransactions(): TransactionData[] {
  const categories = {
    EXPENSE: ['PAYROLL', 'SERVER_COSTS', 'MARKETING', 'SOFTWARE_TOOLS', 'OFFICE_RENT', 'LEGAL_ACCOUNTING', 'TRAVEL', 'MEALS_ENTERTAINMENT'],
    INCOME: ['SALES_REVENUE', 'SUBSCRIPTION_REVENUE', 'SERVICE_REVENUE'],
  };

  const descriptions: Record<string, string[]> = {
    PAYROLL: ['Monthly Payroll - Engineering', 'Monthly Payroll - Marketing', 'Contractor Payment - Design'],
    SERVER_COSTS: ['AWS Monthly', 'Vercel Pro', 'MongoDB Atlas', 'CloudFlare Enterprise'],
    MARKETING: ['Google Ads Campaign', 'Facebook Ad Spend', 'Content Marketing Agency', 'SEO Tools'],
    SOFTWARE_TOOLS: ['Slack Business+', 'GitHub Enterprise', 'Notion Team', 'Figma Organization', 'Linear Pro'],
    OFFICE_RENT: ['WeWork Office Space', 'Monthly Office Lease'],
    LEGAL_ACCOUNTING: ['Legal Retainer Fee', 'QuickBooks Subscription', 'Annual Audit'],
    TRAVEL: ['Flight SFO-NYC', 'Hotel Conference', 'Uber Business'],
    MEALS_ENTERTAINMENT: ['Team Dinner', 'Client Lunch', 'Startup Event'],
    SALES_REVENUE: ['Enterprise License - Acme Corp', 'SMB License - TechStart Inc', 'Annual Contract - DataFlow'],
    SUBSCRIPTION_REVENUE: ['Monthly SaaS Subscriptions', 'Pro Plan Upgrades', 'Enterprise Tier'],
    SERVICE_REVENUE: ['Consulting Engagement', 'Implementation Fee', 'Training Workshop'],
  };

  const transactions: TransactionData[] = [];
  const now = new Date();

  // Generate 8 months of data
  for (let monthOffset = 7; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const monthGrowthFactor = 1 + (7 - monthOffset) * 0.05; // spending grows slightly

    // Revenue transactions (3-5 per month)
    const revenueCount = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < revenueCount; j++) {
      const cat = categories.INCOME[Math.floor(Math.random() * categories.INCOME.length)];
      const descs = descriptions[cat] || ['Revenue'];
      const day = 1 + Math.floor(Math.random() * 28);
      const baseAmount = cat === 'SUBSCRIPTION_REVENUE' ? 8000 + Math.random() * 4000
        : cat === 'SALES_REVENUE' ? 5000 + Math.random() * 15000
        : 3000 + Math.random() * 7000;

      transactions.push({
        id: randomId(),
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString().split('T')[0],
        description: descs[Math.floor(Math.random() * descs.length)],
        amount: Math.round(baseAmount * (1 + (7 - monthOffset) * 0.03) * 100) / 100,
        type: 'INCOME',
        category: cat,
      });
    }

    // Expense transactions (8-15 per month)
    const expenseCount = 8 + Math.floor(Math.random() * 8);
    for (let j = 0; j < expenseCount; j++) {
      const cat = categories.EXPENSE[Math.floor(Math.random() * categories.EXPENSE.length)];
      const descs = descriptions[cat] || ['Expense'];
      const day = 1 + Math.floor(Math.random() * 28);

      let baseAmount: number;
      switch (cat) {
        case 'PAYROLL': baseAmount = 15000 + Math.random() * 10000; break;
        case 'SERVER_COSTS': baseAmount = 2000 + Math.random() * 3000; break;
        case 'MARKETING': baseAmount = 3000 + Math.random() * 5000; break;
        case 'SOFTWARE_TOOLS': baseAmount = 500 + Math.random() * 1500; break;
        case 'OFFICE_RENT': baseAmount = 4000 + Math.random() * 2000; break;
        case 'LEGAL_ACCOUNTING': baseAmount = 1000 + Math.random() * 3000; break;
        case 'TRAVEL': baseAmount = 500 + Math.random() * 2000; break;
        case 'MEALS_ENTERTAINMENT': baseAmount = 200 + Math.random() * 800; break;
        default: baseAmount = 500 + Math.random() * 2000;
      }

      // Add spike to SERVER_COSTS in most recent month for anomaly demo
      if (cat === 'SERVER_COSTS' && monthOffset === 0) {
        baseAmount *= 2.5;
      }

      transactions.push({
        id: randomId(),
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toISOString().split('T')[0],
        description: descs[Math.floor(Math.random() * descs.length)],
        amount: Math.round(baseAmount * monthGrowthFactor * 100) / 100,
        type: 'EXPENSE',
        category: cat,
      });
    }
  }

  return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function generateMockMetrics(): FinancialMetricsData {
  return {
    revenue: 32500,
    expenses: 48200,
    netBurn: 15700,
    runway: 6.1,
    burnTrend: [12000, 13500, 14200, 15000, 15200, 15700],
    cashVelocity: 680,
    monthlyData: [
      { month: '2025-09', revenue: 28000, expenses: 40000, netBurn: 12000 },
      { month: '2025-10', revenue: 29500, expenses: 43000, netBurn: 13500 },
      { month: '2025-11', revenue: 30800, expenses: 45000, netBurn: 14200 },
      { month: '2025-12', revenue: 31200, expenses: 46200, netBurn: 15000 },
      { month: '2026-01', revenue: 31800, expenses: 47000, netBurn: 15200 },
      { month: '2026-02', revenue: 32500, expenses: 48200, netBurn: 15700 },
    ],
    avgMonthlyRevenue: 32500,
    avgMonthlyExpenses: 48200,
  };
}

export function generateMockRisk(): RiskData {
  return {
    riskScore: 72,
    riskLevel: 'CRITICAL',
    bankruptcyProbability90d: 0.41,
    breakdown: {
      runwayRisk: 0.75,
      burnTrendRisk: 0.7,
      volatilityRisk: 0.4,
      revenueRisk: 0.3,
    },
  };
}

export function generateMockAnomalies(): AnomalyData[] {
  return [
    {
      category: 'SERVER_COSTS',
      severity: 'CRITICAL',
      title: 'AWS cost spike detected',
      impact: 'Runway reduced by 1.2 months',
      currentAmount: 12500,
      historicalMean: 4200,
      standardDeviation: 800,
      deviationMultiple: 10.4,
    },
    {
      category: 'MARKETING',
      severity: 'HIGH',
      title: 'Marketing spend surge detected',
      impact: 'Runway reduced by 0.8 months',
      currentAmount: 8500,
      historicalMean: 5200,
      standardDeviation: 1100,
      deviationMultiple: 3.0,
    },
    {
      category: 'TRAVEL',
      severity: 'MEDIUM',
      title: 'Unusual travel expense increase',
      impact: 'Runway reduced by 0.3 months',
      currentAmount: 4200,
      historicalMean: 1800,
      standardDeviation: 600,
      deviationMultiple: 4.0,
    },
  ];
}

export function generateMockInsights(): InsightData[] {
  return [
    {
      title: 'Marketing efficiency declining',
      explanation: 'Marketing spend increased 40% while revenue grew only 8% over the last 3 months. Customer acquisition cost rose from $45 to $72.',
      recommendation: 'Reduce ad spend by 20% and shift budget toward content marketing and SEO which show 3x better ROI.',
      impactEstimate: 'Runway increases by 2.1 months',
    },
    {
      title: 'Server costs growing unsustainably',
      explanation: 'Infrastructure costs increased 198% month-over-month. AWS spend alone jumped from $4,200 to $12,500, likely due to unoptimized queries or over-provisioned resources.',
      recommendation: 'Audit AWS usage, implement auto-scaling, and review database query performance. Consider reserved instances for predictable workloads.',
      impactEstimate: 'Could save $6,000-8,000/month, extending runway by 1.5 months',
    },
    {
      title: 'Revenue concentration risk',
      explanation: '62% of revenue comes from a single enterprise client (Acme Corp). Loss of this client would reduce runway from 6.1 to 2.3 months.',
      recommendation: 'Prioritize sales pipeline diversification. Target 3-5 new mid-market accounts this quarter to reduce dependency below 40%.',
      impactEstimate: 'Reducing concentration risk below 40% significantly improves survival probability',
    },
  ];
}
