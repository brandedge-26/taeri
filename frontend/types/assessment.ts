export type RiskLevel = 'green' | 'yellow' | 'red';

export type FrequencyCategory = '1/week' | '2/week' | '3/week' | '4-7/week';
export type DurationCategory = '<5' | '5-15' | '16-25' | '26-35' | '36-45' | '46-60' | '>60';

export interface Assessment {
  id: string;
  taskId: string;
  taskName: string;
  date: string; // ISO string
  frequency: FrequencyCategory;
  duration: DurationCategory;
  psychological: 1 | 2 | 3;
  posture: 1 | 2 | 3;
  handling: 1 | 2 | 3;
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
