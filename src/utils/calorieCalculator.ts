/**
 * YogaFlow AI - Metabolic Calorie Expenditure Calculator
 * 
 * Uses standard American College of Sports Medicine (ACSM) MET calculation:
 * Calories Burned = MET * Body Weight (kg) * Time (hours)
 * Rate (cal/min) = (MET * 3.5 * Body Weight (kg)) / 200
 */

export interface CalorieEstimateResult {
  totalCalories: number;
  caloriesPerMinute: number;
  durationMinutes: number;
  weightKgUsed: number;
  metValueUsed: number;
  methodologyDisclaimer: string;
}

export const DEFAULT_WEIGHT_KG = 68; // 150 lbs standard adult reference

/**
 * Calculates estimated active energy expenditure from duration and pose MET
 */
export function calculateEstimatedCalories(
  durationSeconds: number,
  metValue: number,
  bodyWeightKg: number = DEFAULT_WEIGHT_KG
): CalorieEstimateResult {
  const safeWeight = bodyWeightKg > 20 && bodyWeightKg < 250 ? bodyWeightKg : DEFAULT_WEIGHT_KG;
  const safeMET = metValue > 1 && metValue < 12 ? metValue : 3.0;
  const durationHours = Math.max(0, durationSeconds) / 3600;
  const durationMinutes = Math.max(0, durationSeconds) / 60;

  // Formula: kcal = MET * weight(kg) * duration(hours)
  const totalCalories = safeMET * safeWeight * durationHours;

  // Rate in kcal per minute
  const caloriesPerMinute = (safeMET * safeWeight) / 60;

  return {
    totalCalories: Math.round(totalCalories * 10) / 10,
    caloriesPerMinute: Math.round(caloriesPerMinute * 100) / 100,
    durationMinutes: Math.round(durationMinutes * 10) / 10,
    weightKgUsed: safeWeight,
    metValueUsed: safeMET,
    methodologyDisclaimer:
      'Estimated using documented ACSM Metabolic Equivalent of Task (MET) calculations based on duration and body weight. Camera pose tracking assesses biomechanical form and does not directly measure heart rate or biometric oxygen consumption.',
  };
}

/**
 * Calculates total calories from an array of practice sessions
 */
export function calculateTotalSessionCalories(
  sessions: Array<{ durationSeconds: number; poseMet?: number }>,
  bodyWeightKg: number = DEFAULT_WEIGHT_KG
): number {
  return sessions.reduce((acc, session) => {
    const met = session.poseMet ?? 3.2;
    const est = calculateEstimatedCalories(session.durationSeconds, met, bodyWeightKg);
    return acc + est.totalCalories;
  }, 0);
}
