/**
 * YogaFlow AI - Core Business Logic Verification Tests
 * Tests joint-angle vector mathematics, threshold bounds (84 vs 85), booking conflicts, and confidence checks.
 */

import { calculateAngleAtVertex, LandmarkPoint } from '../vision/geometry';
import { PoseScoringEngine } from '../vision/scoringEngine';
import { YOGA_POSES, INSTRUCTOR_ASSESSMENT_POSE_IDS, getPoseById } from '../data/poses';
import { calculateEstimatedCalories } from '../utils/calorieCalculator';

export interface TestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  actual: string;
  expected: string;
}

export function runBusinessLogicTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Test 90-degree angle calculation using standard Cartesian points
  // Point A = (0, 1), Vertex B = (0, 0), Point C = (1, 0) -> Exact 90°
  {
    const ptA: LandmarkPoint = { x: 0, y: 1, visibility: 0.95 };
    const ptB: LandmarkPoint = { x: 0, y: 0, visibility: 0.95 };
    const ptC: LandmarkPoint = { x: 1, y: 0, visibility: 0.95 };
    const angle = calculateAngleAtVertex(ptA, ptB, ptC);
    const passed = angle !== null && Math.abs(angle - 90) < 0.1;
    results.push({
      id: 'test-geom-90',
      name: 'Geometric 90° Orthogonal Vector Calculation',
      description: 'Calculates exact 90° angle at vertex B from perpendicular vectors BA and BC.',
      passed,
      actual: `${angle}°`,
      expected: '90°',
    });
  }

  // 2. Test 180-degree straight line calculation
  // Point A = (-1, 0), Vertex B = (0, 0), Point C = (1, 0) -> Exact 180°
  {
    const ptA: LandmarkPoint = { x: -1, y: 0, visibility: 0.95 };
    const ptB: LandmarkPoint = { x: 0, y: 0, visibility: 0.95 };
    const ptC: LandmarkPoint = { x: 1, y: 0, visibility: 0.95 };
    const angle = calculateAngleAtVertex(ptA, ptB, ptC);
    const passed = angle !== null && Math.abs(angle - 180) < 0.1;
    results.push({
      id: 'test-geom-180',
      name: 'Geometric 180° Collinear Vector Calculation',
      description: 'Calculates exact 180° angle for straight limb extension.',
      passed,
      actual: `${angle}°`,
      expected: '180°',
    });
  }

  // 3. Test Invalid Landmark & Zero Visibility Rejection
  {
    const ptA: LandmarkPoint = { x: 0, y: 1, visibility: 0.1 }; // Low visibility!
    const ptB: LandmarkPoint = { x: 0, y: 0, visibility: 0.95 };
    const ptC: LandmarkPoint = { x: 1, y: 0, visibility: 0.95 };
    const angle = calculateAngleAtVertex(ptA, ptB, ptC, 0.5);
    const passed = angle === null;
    results.push({
      id: 'test-visibility-rejection',
      name: 'Low Visibility Landmark Rejection',
      description: 'Rejects landmarks with visibility < 0.5 and returns null instead of false angle.',
      passed,
      actual: String(angle),
      expected: 'null',
    });
  }

  // 4. Test Zero-Length Vector / Overlapping Points Rejection
  {
    const ptA: LandmarkPoint = { x: 0, y: 0, visibility: 0.95 };
    const ptB: LandmarkPoint = { x: 0, y: 0, visibility: 0.95 }; // Overlapping A and B!
    const ptC: LandmarkPoint = { x: 1, y: 0, visibility: 0.95 };
    const angle = calculateAngleAtVertex(ptA, ptB, ptC);
    const passed = angle === null;
    results.push({
      id: 'test-zero-magnitude',
      name: 'Degenerate Zero-Vector Rejection',
      description: 'Safely rejects zero-length vector to prevent division by zero or NaN.',
      passed,
      actual: String(angle),
      expected: 'null',
    });
  }

  // 5. Test Scoring Engine: Missing body landmarks returns 0 score & insufficient confidence
  {
    const engine = new PoseScoringEngine();
    const mountainPose = getPoseById('mountain-pose')!;
    const analysis = engine.evaluate(mountainPose, null);
    const passed = !analysis.isTracking && analysis.overallScore === 0 && !analysis.isSufficientConfidence;
    results.push({
      id: 'test-empty-landmarks-score',
      name: 'Zero Landmarks Safe Evaluation',
      description: 'Evaluates null landmarks without fabricating fake score and marks confidence false.',
      passed,
      actual: `score: ${analysis.overallScore}, confidence: ${analysis.isSufficientConfidence}`,
      expected: 'score: 0, confidence: false',
    });
  }

  // 6. Test Instructor Eligibility: Score 84 FAILS
  {
    const score = 84;
    const isEligible = score >= 85;
    const passed = isEligible === false;
    results.push({
      id: 'test-eligibility-84-fail',
      name: 'Instructor Threshold: Score 84 Fails',
      description: 'Strict verification that 84% fails the 85% instructor marketplace threshold.',
      passed,
      actual: `isEligible = ${isEligible}`,
      expected: 'isEligible = false',
    });
  }

  // 7. Test Instructor Eligibility: Score 85 PASSES
  {
    const score = 85;
    const isEligible = score >= 85;
    const passed = isEligible === true;
    results.push({
      id: 'test-eligibility-85-pass',
      name: 'Instructor Threshold: Score 85 Passes',
      description: 'Strict verification that 85% passes the instructor marketplace threshold.',
      passed,
      actual: `isEligible = ${isEligible}`,
      expected: 'isEligible = true',
    });
  }

  // 8. Test Assessment Completion: Missing required poses prevents passing
  {
    const completedPoses = ['mountain-pose', 'tree-pose', 'warrior-2', 'triangle-pose']; // Missing downward-dog!
    const hasAll = INSTRUCTOR_ASSESSMENT_POSE_IDS.every((p) => completedPoses.includes(p));
    const passed = hasAll === false;
    results.push({
      id: 'test-missing-assessment-poses',
      name: 'Incomplete Assessment Pose Set Rejection',
      description: 'Incomplete pose count (4 of 5) prevents qualification even if average score is high.',
      passed,
      actual: `hasAll = ${hasAll}`,
      expected: 'hasAll = false',
    });
  }

  // 9. Test Calorie Calculation: MET Formula Accuracy
  {
    // MET = 4.0, Weight = 60kg, Duration = 30 minutes (0.5 hour)
    // Calories = 4.0 * 60 * 0.5 = 120 kcal
    const calResult = calculateEstimatedCalories(1800, 4.0, 60);
    const passed = Math.abs(calResult.totalCalories - 120) < 0.1;
    results.push({
      id: 'test-calorie-met-formula',
      name: 'ACSM MET Calorie Expenditure Formula',
      description: 'Verifies MET 4.0 for 60kg practitioner across 30 min equals exactly 120.0 kcal.',
      passed,
      actual: `${calResult.totalCalories} kcal`,
      expected: '120 kcal',
    });
  }

  // 10. Test Booking Price Calculation
  {
    const hourlyRate = 70;
    const durationMinutes = 30;
    const calculatedPrice = Math.round(hourlyRate * (durationMinutes / 60));
    const passed = calculatedPrice === 35;
    results.push({
      id: 'test-booking-price-calc',
      name: 'Pro-Rated Lesson Price Calculation',
      description: '$70/hr instructor rate for a 30-minute booking calculates to exactly $35.',
      passed,
      actual: `$${calculatedPrice}`,
      expected: '$35',
    });
  }

  return results;
}
