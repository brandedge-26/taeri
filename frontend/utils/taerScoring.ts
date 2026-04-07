import type { DurationCategory, FrequencyCategory, RiskLevel, StabilityLevel } from '@/types/assessment';

// Adjustment factor table: duration rows × frequency columns
// Columns: 1/week, 2/week, 3/week, 4-7/week
const ADJUSTMENT_TABLE: Record<DurationCategory, [number, number, number, number]> = {
  '<5':    [0.006, 0.01, 0.02, 0.04],
  '5-15':  [0.02,  0.05, 0.07, 0.17],
  '16-25': [0.05,  0.10, 0.15, 0.34],
  '26-35': [0.07,  0.15, 0.22, 0.51],
  '36-45': [0.10,  0.20, 0.29, 0.68],
  '46-60': [0.12,  0.26, 0.38, 0.88],
  '>60':   [0.18,  0.38, 0.54, 1.25],
};

const FREQUENCY_INDEX: Record<FrequencyCategory, number> = {
  '1/week':   0,
  '2/week':   1,
  '3/week':   2,
  '4-7/week': 3,
};

export function getAdjustmentFactor(duration: DurationCategory, frequency: FrequencyCategory): number {
  return ADJUSTMENT_TABLE[duration][FREQUENCY_INDEX[frequency]];
}

export function calculateFinalScore(
  psychological: number,
  posture: number,
  handling: number,
  duration: DurationCategory,
  frequency: FrequencyCategory,
): { rawScore: number; adjustmentFactor: number; finalScore: number; riskLevel: RiskLevel } {
  const rawScore = psychological + posture + handling;
  const adjustmentFactor = getAdjustmentFactor(duration, frequency);
  const finalScore = parseFloat((rawScore * adjustmentFactor).toFixed(3));

  let riskLevel: RiskLevel;
  if (finalScore < 1.6) {
    riskLevel = 'green';
  } else if (finalScore <= 5.0) {
    riskLevel = 'yellow';
  } else {
    riskLevel = 'red';
  }

  return { rawScore, adjustmentFactor, finalScore, riskLevel };
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'green':  return 'Low Risk';
    case 'yellow': return 'Moderate Risk';
    case 'red':    return 'High Risk';
  }
}

export function getRiskSentence(level: RiskLevel): string {
  switch (level) {
    case 'green':  return 'Task is easy to perform, but required caution.';
    case 'yellow': return 'Task is not easy to perform, required more consideration.';
    case 'red':    return 'Task is hard to perform, further investigation required urgently.';
  }
}

export function getStabilityLabel(level: StabilityLevel): string {
  switch (level) {
    case 'very_stable':        return 'Very Stable';
    case 'somewhat_unsteady':  return 'Somewhat Unsteady';
    case 'very_unsteady':      return 'Very Unsteady';
  }
}

export function getStabilityDescription(level: StabilityLevel): string {
  switch (level) {
    case 'very_stable':
      return 'Felt balanced and fully in control during the task, with no loss of balance, wobbling, or need for support.';
    case 'somewhat_unsteady':
      return 'Felt slightly unstable at times, needed to adjust your posture, slow down, or briefly hold onto something for support.';
    case 'very_unsteady':
      return 'Felt significantly unstable, at risk of losing balance, required support to continue, or stopped due to fear of falling.';
  }
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'green':  return '#10B981';
    case 'yellow': return '#F59E0B';
    case 'red':    return '#EF4444';
  }
}

export function getRiskBg(level: RiskLevel): string {
  switch (level) {
    case 'green':  return '#D1FAE5';
    case 'yellow': return '#FEF3C7';
    case 'red':    return '#FEE2E2';
  }
}
