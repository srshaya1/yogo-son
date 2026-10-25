/**
 * YogaFlow AI - Pose-Specific Scoring Engine & Real-Time Biomechanical Evaluator
 */

import { YogaPose, LivePoseAnalysis, JointAngleMeasurement } from '../types';
import {
  LandmarkPoint,
  calculateAngleAtVertex,
  calculateTorsoInclination,
  calculateSymmetryRatio,
  AngleSmoother,
  MEDIAPIPE_LANDMARKS as LM,
  VISIBILITY_THRESHOLD,
} from './geometry';

export class PoseScoringEngine {
  private smoother = new AngleSmoother(0.35);

  /**
   * Evaluates live landmarks against a specific pose configuration
   */
  evaluate(
    pose: YogaPose,
    landmarks: LandmarkPoint[] | null | undefined
  ): LivePoseAnalysis {
    // Empty / no landmarks state
    if (!landmarks || landmarks.length < 25) {
      return {
        isTracking: false,
        trackingConfidence: 0,
        isSufficientConfidence: false,
        overallScore: 0,
        categoryScores: {
          jointAngles: 0,
          majorAlignment: 0,
          poseSpecific: 0,
          symmetryStability: 0,
        },
        jointMeasurements: {},
        feedbackMessages: ['Step back into camera view so your full body is visible.'],
        primaryError: 'No body landmarks detected in frame',
        torsoInclination: 0,
        symmetryRatio: 1,
        validLandmarksCount: 0,
      };
    }

    // Check relevant landmarks visibility
    let visibleRelevantCount = 0;
    let totalRelevantConfidence = 0;

    for (const lmIndex of pose.relevantLandmarks) {
      const pt = landmarks[lmIndex];
      const vis = pt?.visibility ?? 0;
      if (vis >= VISIBILITY_THRESHOLD) {
        visibleRelevantCount++;
      }
      totalRelevantConfidence += vis;
    }

    const averageConfidence = pose.relevantLandmarks.length > 0
      ? totalRelevantConfidence / pose.relevantLandmarks.length
      : 0;

    const visibilityRatio = pose.relevantLandmarks.length > 0
      ? visibleRelevantCount / pose.relevantLandmarks.length
      : 0;

    // Minimum required: at least 65% of required landmarks must be clearly visible
    const isSufficientConfidence = visibilityRatio >= 0.65 && averageConfidence >= 0.50;

    if (!isSufficientConfidence) {
      return {
        isTracking: true,
        trackingConfidence: Math.round(averageConfidence * 100) / 100,
        isSufficientConfidence: false,
        overallScore: 0,
        categoryScores: {
          jointAngles: 0,
          majorAlignment: 0,
          poseSpecific: 0,
          symmetryStability: 0,
        },
        jointMeasurements: {},
        feedbackMessages: [
          'Insufficient tracking confidence — adjust your position so your full body is visible in the frame.',
        ],
        primaryError: 'Insufficient tracking confidence — adjust your position',
        torsoInclination: 0,
        symmetryRatio: 1,
        validLandmarksCount: visibleRelevantCount,
      };
    }

    // 1. Joint Angles Evaluation (40%)
    const jointMeasurements: Record<string, JointAngleMeasurement> = {};
    const feedbackMessages: string[] = [];
    let jointScoreSum = 0;
    let jointWeightSum = 0;

    for (const criterion of pose.angleCriteria) {
      const [idxA, idxB, idxC] = criterion.landmarkIndices;
      const ptA = landmarks[idxA];
      const ptB = landmarks[idxB];
      const ptC = landmarks[idxC];

      const rawAngle = calculateAngleAtVertex(ptA, ptB, ptC, VISIBILITY_THRESHOLD);
      const smoothedAngle = this.smoother.smooth(`${pose.id}_${criterion.jointKey}`, rawAngle);

      if (smoothedAngle === null) {
        jointMeasurements[criterion.jointKey] = {
          currentAngle: 0,
          targetAngle: criterion.targetAngle,
          tolerance: criterion.tolerance,
          deviation: 0,
          score: 0,
          status: 'insufficient_confidence',
          label: criterion.name,
          feedback: `Ensure ${criterion.name} is visible to camera`,
          vertexPoint: null,
        };
        continue;
      }

      const deviation = Math.abs(smoothedAngle - criterion.targetAngle);
      let jointScore = 100;
      let status: 'optimal' | 'moderate' | 'deviated' = 'optimal';
      let feedback = `Excellent alignment (${Math.round(smoothedAngle)}°)`;

      if (deviation <= criterion.tolerance) {
        // Within tolerance: 90 - 100
        jointScore = 100 - (deviation / criterion.tolerance) * 10;
        status = 'optimal';
      } else if (deviation <= criterion.tolerance * 2.2) {
        // Moderate deviation: 65 - 89
        const excess = deviation - criterion.tolerance;
        const maxExcess = criterion.tolerance * 1.2;
        jointScore = Math.max(65, 90 - (excess / maxExcess) * 25);
        status = 'moderate';
        feedback = smoothedAngle < criterion.targetAngle
          ? criterion.correctiveTooLow
          : criterion.correctiveTooHigh;
        feedbackMessages.push(feedback);
      } else {
        // Significant deviation: 0 - 64
        const excess = deviation - (criterion.tolerance * 2.2);
        jointScore = Math.max(20, 65 - (excess / 30) * 45);
        status = 'deviated';
        feedback = smoothedAngle < criterion.targetAngle
          ? criterion.correctiveTooLow
          : criterion.correctiveTooHigh;
        feedbackMessages.push(feedback);
      }

      jointScoreSum += jointScore * criterion.weight;
      jointWeightSum += criterion.weight;

      const vertexPoint = ptB ? { x: ptB.x, y: ptB.y } : null;

      jointMeasurements[criterion.jointKey] = {
        currentAngle: smoothedAngle,
        targetAngle: criterion.targetAngle,
        tolerance: criterion.tolerance,
        deviation: Math.round(deviation * 10) / 10,
        score: Math.round(jointScore),
        status,
        label: criterion.name,
        feedback,
        vertexPoint,
      };
    }

    const calculatedJointAngleScore = jointWeightSum > 0
      ? jointScoreSum / jointWeightSum
      : 0;

    // 2. Major Body Alignment (25%)
    // Torso inclination check
    const torsoAngle = calculateTorsoInclination(
      landmarks[LM.LEFT_SHOULDER],
      landmarks[LM.RIGHT_SHOULDER],
      landmarks[LM.LEFT_HIP],
      landmarks[LM.RIGHT_HIP],
      VISIBILITY_THRESHOLD
    ) ?? 0;

    let majorAlignmentScore = 85;
    if (pose.category === 'standing' && pose.id === 'mountain-pose') {
      // In Mountain pose, torso should be close to vertical (0° - 12°)
      majorAlignmentScore = Math.max(30, 100 - (torsoAngle * 3.5));
      if (torsoAngle > 15) {
        feedbackMessages.push('Stand upright; avoid leaning forward or backward.');
      }
    } else if (pose.id === 'plank-pose') {
      // In Plank, torso should be horizontal-slanted (~65° - 80°)
      const diff = Math.abs(torsoAngle - 72);
      majorAlignmentScore = Math.max(30, 100 - (diff * 2.5));
    } else {
      majorAlignmentScore = 88;
    }

    // 3. Pose-Specific Positioning (20%)
    let poseSpecificScore = 90;
    if (pose.id === 'tree-pose') {
      // In tree pose, one foot should be elevated well above the other ankle
      const leftAnkle = landmarks[LM.LEFT_ANKLE];
      const rightAnkle = landmarks[LM.RIGHT_ANKLE];
      if (leftAnkle && rightAnkle) {
        const ankleHeightDiff = Math.abs(leftAnkle.y - rightAnkle.y);
        // Normalized screen height diff should be >= 0.12
        if (ankleHeightDiff < 0.10) {
          poseSpecificScore = 45;
          feedbackMessages.push('Lift one foot higher onto your calf or inner thigh.');
        } else {
          poseSpecificScore = 95;
        }
      }
    } else if (pose.id === 'warrior-2') {
      // Stance width between ankles
      const leftAnkle = landmarks[LM.LEFT_ANKLE];
      const rightAnkle = landmarks[LM.RIGHT_ANKLE];
      if (leftAnkle && rightAnkle) {
        const stanceWidth = Math.abs(leftAnkle.x - rightAnkle.x);
        if (stanceWidth < 0.25) {
          poseSpecificScore = 60;
          feedbackMessages.push('Widen your stance for a deeper Warrior foundation.');
        } else {
          poseSpecificScore = 94;
        }
      }
    } else if (pose.id === 'downward-dog') {
      // Hands and feet separation
      const leftWrist = landmarks[LM.LEFT_WRIST];
      const leftAnkle = landmarks[LM.LEFT_ANKLE];
      if (leftWrist && leftAnkle) {
        const distance = Math.abs(leftWrist.x - leftAnkle.x);
        if (distance < 0.20) {
          poseSpecificScore = 65;
          feedbackMessages.push('Walk hands further forward to lengthen your inverted V shape.');
        } else {
          poseSpecificScore = 92;
        }
      }
    }

    // 4. Symmetry & Stability (15%)
    const shoulderSymmetry = calculateSymmetryRatio(
      landmarks[LM.LEFT_SHOULDER],
      landmarks[LM.RIGHT_SHOULDER]
    ) ?? 1.0;

    let symmetryStabilityScore = Math.round(shoulderSymmetry * 100);
    if (pose.id === 'mountain-pose' && shoulderSymmetry < 0.85) {
      feedbackMessages.push('Level your shoulders evenly across your chest.');
    }

    // Calculate final weighted total
    const weights = pose.scoringWeights;
    const rawTotal = (
      (calculatedJointAngleScore * weights.jointAngles) +
      (majorAlignmentScore * weights.majorAlignment) +
      (poseSpecificScore * weights.poseSpecific) +
      (symmetryStabilityScore * weights.symmetryStability)
    );

    const overallScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    // Select primary error
    const primaryError = feedbackMessages.length > 0 ? feedbackMessages[0] : null;

    if (feedbackMessages.length === 0) {
      feedbackMessages.push('Posture and joint alignment are in optimal form! Hold steady and breathe.');
    }

    return {
      isTracking: true,
      trackingConfidence: Math.round(averageConfidence * 100) / 100,
      isSufficientConfidence: true,
      overallScore,
      categoryScores: {
        jointAngles: Math.round(calculatedJointAngleScore),
        majorAlignment: Math.round(majorAlignmentScore),
        poseSpecific: Math.round(poseSpecificScore),
        symmetryStability: Math.round(symmetryStabilityScore),
      },
      jointMeasurements,
      feedbackMessages,
      primaryError,
      torsoInclination: Math.round(torsoAngle),
      symmetryRatio: shoulderSymmetry,
      validLandmarksCount: visibleRelevantCount,
    };
  }

  reset(): void {
    this.smoother.reset();
  }
}
