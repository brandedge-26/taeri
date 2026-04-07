export type RiskLevel = 'green' | 'yellow' | 'red';
export type StabilityLevel = 'very_stable' | 'somewhat_unsteady' | 'very_unsteady';

export type FrequencyCategory = '1/week' | '2/week' | '3/week' | '4-7/week';
export type DurationCategory = '<5' | '5-15' | '16-25' | '26-35' | '36-45' | '46-60' | '>60';

export interface Assessment {
  id: string;
  taskId: string;
  taskName: string;
  date: string; // ISO string
  frequency: FrequencyCategory;
  duration: DurationCategory;
  // Psychological sub-scores
  physicalDemand: 1 | 2 | 3;
  complexity: 1 | 2 | 3;
  psychological: number; // sum: 2–6
  // Posture sub-scores
  neck: 1 | 2 | 3;
  arm: 1 | 2 | 3;
  wrist: 1 | 2 | 3;
  back: 1 | 2 | 3;
  leg: 1 | 2 | 3;
  posture: number; // sum: 5–15
  // Manual handling & stability
  handling: 1 | 2 | 3;
  stability: StabilityLevel;
  // Computed
  rawScore: number;
  adjustmentFactor: number;
  finalScore: number;
  riskLevel: RiskLevel;
}

export interface Task {
  id: string;
  name: string;
  icon: string;
}
