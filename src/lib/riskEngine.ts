// BurnSight Startup Risk Engine
// Computes a composite startup survival risk score

export interface RiskInput {
  runwayMonths: number;
  burnTrend: number[];
  expenses: number[];
  revenues: number[];
}

export interface RiskOutput {
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

function computeRunwayRisk(runwayMonths: number): number {
  if (runwayMonths >= 999) return 0;
  if (runwayMonths > 12) return 0;
  if (runwayMonths >= 6) return 0.5;
  if (runwayMonths >= 3) return 0.75;
  return 1;
}

function computeBurnTrendRisk(burnTrend: number[]): number {
  if (burnTrend.length < 2) return 0.3; // insufficient data = moderate risk

  // Calculate trend slope
  const n = burnTrend.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += burnTrend[i];
    sumXY += i * burnTrend[i];
    sumX2 += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Normalize: positive slope (increasing burn) = higher risk
  const avgBurn = sumY / n;
  if (avgBurn === 0) return 0;

  const normalizedSlope = slope / Math.abs(avgBurn);

  if (normalizedSlope > 0.2) return 1;    // burn accelerating rapidly
  if (normalizedSlope > 0.05) return 0.7;  // burn growing
  if (normalizedSlope > -0.05) return 0.3; // stable
  return 0;                                // burn decreasing
}

function computeVolatilityRisk(expenses: number[]): number {
  if (expenses.length < 3) return 0.3;

  const mean = expenses.reduce((a, b) => a + b, 0) / expenses.length;
  if (mean === 0) return 0;

  const variance = expenses.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / expenses.length;
  const stddev = Math.sqrt(variance);
  const cv = stddev / mean; // coefficient of variation

  if (cv > 0.5) return 1;
  if (cv > 0.3) return 0.7;
  if (cv > 0.15) return 0.4;
  return 0.1;
}

function computeRevenueRisk(revenues: number[]): number {
  if (revenues.length === 0) return 1; // no revenue = high risk

  const allZero = revenues.every(r => r === 0);
  if (allZero) return 1;

  // Check if revenue is growing
  const recentRevenues = revenues.slice(-3);
  const prevRevenues = revenues.slice(-6, -3);

  if (prevRevenues.length === 0) {
    // Only recent data - check if there's revenue at all
    const avgRecent = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;
    return avgRecent > 0 ? 0.3 : 1;
  }

  const avgRecent = recentRevenues.reduce((a, b) => a + b, 0) / recentRevenues.length;
  const avgPrev = prevRevenues.reduce((a, b) => a + b, 0) / prevRevenues.length;

  if (avgPrev === 0) return avgRecent > 0 ? 0.3 : 1;

  const growthRate = (avgRecent - avgPrev) / avgPrev;

  if (growthRate > 0.1) return 0;       // strong growth
  if (growthRate > 0) return 0.2;       // moderate growth
  if (growthRate > -0.1) return 0.5;    // flat / slight decline
  return 0.8;                            // declining
}

function computeBankruptcyProbability(riskScore: number, runwayMonths: number): number {
  // Simplified bankruptcy probability model
  let prob = 0;

  // Base from risk score
  if (riskScore >= 80) prob = 0.6 + (riskScore - 80) * 0.015;
  else if (riskScore >= 60) prob = 0.3 + (riskScore - 60) * 0.015;
  else if (riskScore >= 40) prob = 0.1 + (riskScore - 40) * 0.01;
  else prob = riskScore * 0.0025;

  // Adjust by runway
  if (runwayMonths < 3) prob *= 1.5;
  else if (runwayMonths < 6) prob *= 1.2;
  else if (runwayMonths > 12) prob *= 0.5;

  return Math.min(Math.round(prob * 100) / 100, 0.99);
}

export function computeRiskScore(input: RiskInput): RiskOutput {
  const runwayRisk = computeRunwayRisk(input.runwayMonths);
  const burnTrendRisk = computeBurnTrendRisk(input.burnTrend);
  const volatilityRisk = computeVolatilityRisk(input.expenses);
  const revenueRisk = computeRevenueRisk(input.revenues);

  // Weighted composite score (0-100)
  const riskScore = Math.round(
    (40 * runwayRisk +
     25 * burnTrendRisk +
     20 * volatilityRisk +
     15 * revenueRisk) * 100 / 100
  );

  // Determine risk level
  let riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
  if (riskScore >= 60) riskLevel = 'CRITICAL';
  else if (riskScore >= 35) riskLevel = 'WARNING';
  else riskLevel = 'SAFE';

  const bankruptcyProbability90d = computeBankruptcyProbability(riskScore, input.runwayMonths);

  return {
    riskScore,
    riskLevel,
    bankruptcyProbability90d,
    breakdown: {
      runwayRisk: Math.round(runwayRisk * 100) / 100,
      burnTrendRisk: Math.round(burnTrendRisk * 100) / 100,
      volatilityRisk: Math.round(volatilityRisk * 100) / 100,
      revenueRisk: Math.round(revenueRisk * 100) / 100,
    },
  };
}
