// BurnSight Founder Metrics Engine
// Computes deep startup founder metrics from transaction data
// Pure math — zero AI dependency

export interface FounderMetrics {
    grossMargin: number;
    opExRatio: number;
    revenuePerEmployee: number;
    estimatedHeadcount: number;
    payrollToRevenueRatio: number;
    isDefaultAlive: boolean;
    defaultAliveVerdict: string;
    costCuttingOpportunities: CostCuttingItem[];
}

export interface CostCuttingItem {
    category: string;
    currentMonthly: number;
    potentialSaving: number;
    runwayImpactMonths: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Categories considered Cost of Goods Sold (direct costs to deliver product)
const COGS_CATEGORIES = ['SERVER_COSTS', 'Infrastructure', 'Hosting'];

// Categories that are operational overhead
const OPEX_CATEGORIES = [
    'PAYROLL', 'Payroll',
    'OFFICE_RENT', 'Office',
    'SOFTWARE_TOOLS', 'Software',
    'LEGAL_ACCOUNTING', 'Legal',
    'UTILITIES', 'Utilities',
    'INSURANCE', 'Insurance',
    'CONSULTING', 'Consulting',
    'MARKETING', 'Marketing',
    'TRAVEL', 'Travel',
    'MEALS_ENTERTAINMENT',
    'EQUIPMENT', 'Equipment',
    'OTHER_EXPENSE', 'Other',
];

const PAYROLL_CATEGORIES = ['PAYROLL', 'Payroll'];

// Estimated average fully-loaded monthly cost per employee
const AVG_EMPLOYEE_COST = 8500;

interface MonthlyBucket {
    month: string;
    revenue: number;
    expenses: number;
    payroll: number;
    cogs: number;
    categoryBreakdown: Map<string, number>;
}

function bucketByMonth(
    topExpenseCategories: { category: string; amount: number; percentOfTotal: number; trend: string }[],
    monthlyBreakdown: { month: string; revenue: number; expenses: number; netBurn: number }[],
    monthlyRevenue: number,
    monthlyBurnRate: number
): MonthlyBucket[] {
    // Build category fraction map from topExpenseCategories
    const categoryFractions = new Map<string, number>();
    const totalPercent = topExpenseCategories.reduce((s, c) => s + c.percentOfTotal, 0);

    for (const cat of topExpenseCategories) {
        categoryFractions.set(cat.category, cat.percentOfTotal / Math.max(totalPercent, 1));
    }

    return monthlyBreakdown.map(m => {
        const totalExp = m.expenses;
        const breakdown = new Map<string, number>();
        let payroll = 0;
        let cogs = 0;

        for (const cat of topExpenseCategories) {
            const fraction = categoryFractions.get(cat.category) || 0;
            const amount = totalExp * fraction;
            breakdown.set(cat.category, amount);

            if (PAYROLL_CATEGORIES.some(p => cat.category.toLowerCase().includes(p.toLowerCase()))) {
                payroll += amount;
            }
            if (COGS_CATEGORIES.some(c => cat.category.toLowerCase().includes(c.toLowerCase()))) {
                cogs += amount;
            }
        }

        return {
            month: m.month,
            revenue: m.revenue,
            expenses: totalExp,
            payroll,
            cogs,
            categoryBreakdown: breakdown,
        };
    });
}

export function computeFounderMetrics(
    monthlyRevenue: number,
    monthlyBurnRate: number,
    cashBalance: number,
    topExpenseCategories: { category: string; amount: number; percentOfTotal: number; trend: string }[],
    monthlyBreakdown: { month: string; revenue: number; expenses: number; netBurn: number }[]
): FounderMetrics {
    const totalExpenses = monthlyRevenue + monthlyBurnRate; // expenses = revenue + netBurn

    // ─── Estimate COGS ───
    let monthlyCOGS = 0;
    for (const cat of topExpenseCategories) {
        if (COGS_CATEGORIES.some(c => cat.category.toLowerCase().includes(c.toLowerCase()))) {
            monthlyCOGS += cat.amount;
        }
    }

    // ─── Gross Margin ───
    const grossMargin = monthlyRevenue > 0
        ? Math.round(((monthlyRevenue - monthlyCOGS) / monthlyRevenue) * 1000) / 10
        : 0;

    // ─── OpEx Ratio ───
    const opExRatio = monthlyRevenue > 0
        ? Math.round((totalExpenses / monthlyRevenue) * 1000) / 10
        : 999;

    // ─── Payroll Analysis ───
    let monthlyPayroll = 0;
    for (const cat of topExpenseCategories) {
        if (PAYROLL_CATEGORIES.some(p => cat.category.toLowerCase().includes(p.toLowerCase()))) {
            monthlyPayroll += cat.amount;
        }
    }

    const estimatedHeadcount = monthlyPayroll > 0
        ? Math.max(1, Math.round(monthlyPayroll / AVG_EMPLOYEE_COST))
        : 1;

    const revenuePerEmployee = Math.round(monthlyRevenue / estimatedHeadcount);

    const payrollToRevenueRatio = monthlyRevenue > 0
        ? Math.round((monthlyPayroll / monthlyRevenue) * 1000) / 10
        : 0;

    // ─── Default Alive (Paul Graham's Test) ───
    // "If you're a startup and you have constant growth and constant expenses,
    //  will you become profitable before you run out of money?"
    const { isDefaultAlive, defaultAliveVerdict } = computeDefaultAlive(
        monthlyBreakdown, cashBalance, monthlyBurnRate
    );

    // ─── Cost Cutting Opportunities ───
    const costCuttingOpportunities = computeCostCuttingOpportunities(
        topExpenseCategories, monthlyBurnRate, cashBalance
    );

    return {
        grossMargin,
        opExRatio,
        revenuePerEmployee,
        estimatedHeadcount,
        payrollToRevenueRatio,
        isDefaultAlive,
        defaultAliveVerdict,
        costCuttingOpportunities,
    };
}

function computeDefaultAlive(
    monthlyBreakdown: { month: string; revenue: number; expenses: number; netBurn: number }[],
    cashBalance: number,
    currentNetBurn: number
): { isDefaultAlive: boolean; defaultAliveVerdict: string } {
    if (monthlyBreakdown.length < 2) {
        return {
            isDefaultAlive: false,
            defaultAliveVerdict: 'Insufficient data to determine. Need at least 2 months of history.',
        };
    }

    // Already profitable?
    if (currentNetBurn <= 0) {
        return {
            isDefaultAlive: true,
            defaultAliveVerdict: 'You are already cash-flow positive. Default alive by definition.',
        };
    }

    // Calculate revenue growth rate (compound MoM)
    const revenues = monthlyBreakdown.map(m => m.revenue);
    const recentRevenues = revenues.slice(-6);
    const firstRev = recentRevenues[0];
    const lastRev = recentRevenues[recentRevenues.length - 1];
    const months = recentRevenues.length - 1;

    if (firstRev <= 0 || months <= 0) {
        return {
            isDefaultAlive: false,
            defaultAliveVerdict: 'No meaningful revenue growth detected. At current burn you will exhaust cash without reaching profitability.',
        };
    }

    const monthlyGrowthRate = Math.pow(lastRev / firstRev, 1 / months) - 1;

    // Calculate expense growth rate
    const expenses = monthlyBreakdown.map(m => m.expenses);
    const recentExpenses = expenses.slice(-6);
    const firstExp = recentExpenses[0];
    const lastExp = recentExpenses[recentExpenses.length - 1];
    const expGrowthRate = firstExp > 0
        ? Math.pow(lastExp / firstExp, 1 / months) - 1
        : 0;

    // Simulate forward: does revenue catch expenses before cash runs out?
    let cash = cashBalance;
    let revenue = lastRev;
    let expense = lastExp;
    let monthsForward = 0;
    const maxMonths = 60; // 5x years max lookahead

    while (monthsForward < maxMonths && cash > 0) {
        revenue *= (1 + monthlyGrowthRate);
        expense *= (1 + expGrowthRate);

        if (revenue >= expense) {
            return {
                isDefaultAlive: true,
                defaultAliveVerdict: `At current ${(monthlyGrowthRate * 100).toFixed(1)}% MoM revenue growth and ${(expGrowthRate * 100).toFixed(1)}% expense growth, you reach profitability in ~${monthsForward + 1} months with $${Math.round(cash).toLocaleString()} remaining.`,
            };
        }

        cash -= (expense - revenue);
        monthsForward++;
    }

    return {
        isDefaultAlive: false,
        defaultAliveVerdict: `At current ${(monthlyGrowthRate * 100).toFixed(1)}% MoM revenue growth, expenses outpace revenue. Cash runs out in ~${monthsForward} months before reaching profitability. You need to either cut costs or accelerate growth.`,
    };
}

function computeCostCuttingOpportunities(
    topExpenseCategories: { category: string; amount: number; percentOfTotal: number; trend: string }[],
    monthlyBurnRate: number,
    cashBalance: number
): CostCuttingItem[] {
    if (monthlyBurnRate <= 0) return [];

    const currentRunway = cashBalance / monthlyBurnRate;

    return topExpenseCategories
        .filter(cat => cat.amount > 0)
        .map(cat => {
            const saving = Math.round(cat.amount * 0.2); // 20% cut
            const newBurn = monthlyBurnRate - saving;
            const newRunway = newBurn > 0 ? cashBalance / newBurn : 999;
            const runwayImpact = Math.round((newRunway - currentRunway) * 10) / 10;

            let priority: 'HIGH' | 'MEDIUM' | 'LOW';
            if (runwayImpact >= 1.0) priority = 'HIGH';
            else if (runwayImpact >= 0.3) priority = 'MEDIUM';
            else priority = 'LOW';

            return {
                category: cat.category,
                currentMonthly: Math.round(cat.amount),
                potentialSaving: saving,
                runwayImpactMonths: runwayImpact,
                priority,
            };
        })
        .sort((a, b) => b.runwayImpactMonths - a.runwayImpactMonths);
}
