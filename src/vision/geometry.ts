/**
 * YogaFlow AI - Biomechanical Geometry & Landmark Math Engine
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export const MEDIAPIPE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export const VISIBILITY_THRESHOLD = 0.5;

/**
 * Calculates the interior angle in degrees at vertex B formed by points A-B-C.
 * 
 * Algorithm:
 * 1. Vector BA = A - B
 * 2. Vector BC = C - B
 * 3. Dot product = (BA.x * BC.x) + (BA.y * BC.y)
 * 4. Magnitudes = |BA| * |BC|
 * 5. Cosine = Dot product / Magnitudes
 * 6. Clamp to [-1, 1] to prevent NaN due to floating point inaccuracies
 * 7. Inverse cosine in radians, convert to degrees (0° - 180°)
 */
export function calculateAngleAtVertex(
  a: LandmarkPoint | null | undefined,
  b: LandmarkPoint | null | undefined,
  c: LandmarkPoint | null | undefined,
  minVisibility: number = VISIBILITY_THRESHOLD
): number | null {
  if (!a || !b || !c) return null;

  // Check visibility if available
  if (
    (a.visibility !== undefined && a.visibility < minVisibility) ||
    (b.visibility !== undefined && b.visibility < minVisibility) ||
    (c.visibility !== undefined && c.visibility < minVisibility)
  ) {
    return null;
  }

  // Reject non-finite coordinates
  if (
    !Number.isFinite(a.x) || !Number.isFinite(a.y) ||
    !Number.isFinite(b.x) || !Number.isFinite(b.y) ||
    !Number.isFinite(c.x) || !Number.isFinite(c.y)
  ) {
    return null;
  }

  // Vector BA: from B to A
  const bax = a.x - b.x;
  const bay = a.y - b.y;

  // Vector BC: from B to C
  const bcx = c.x - b.x;
  const bcy = c.y - b.y;

  // Calculate magnitudes
  const magBA = Math.hypot(bax, bay);
  const magBC = Math.hypot(bcx, bcy);

  // Reject zero-length vectors (overlapping points)
  if (magBA < 1e-6 || magBC < 1e-6) {
    return null;
  }

  // Dot product
  const dotProduct = (bax * bcx) + (bay * bcy);

  // Cosine with strict clamping
  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (magBA * magBC)));

  // Convert acos radians to degrees
  const radians = Math.acos(cosAngle);
  const degrees = (radians * 180) / Math.PI;

  return Math.round(degrees * 10) / 10;
}

/**
 * Calculates vertical inclination angle of the torso (from mid-hip to mid-shoulder relative to vertical)
 * 0° = perfectly upright vertical, 90° = horizontal parallel to ground
 */
export function calculateTorsoInclination(
  leftShoulder: LandmarkPoint | null | undefined,
  rightShoulder: LandmarkPoint | null | undefined,
  leftHip: LandmarkPoint | null | undefined,
  rightHip: LandmarkPoint | null | undefined,
  minVisibility: number = VISIBILITY_THRESHOLD
): number | null {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

  if (
    (leftShoulder.visibility ?? 1) < minVisibility ||
    (rightShoulder.visibility ?? 1) < minVisibility ||
    (leftHip.visibility ?? 1) < minVisibility ||
    (rightHip.visibility ?? 1) < minVisibility
  ) {
    return null;
  }

  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  const dx = midShoulderX - midHipX;
  const dy = midShoulderY - midHipY; // in screen space, up is negative y

  const mag = Math.hypot(dx, dy);
  if (mag < 1e-6) return null;

  // Vertical vector pointing upward in screen coordinates: (0, -1)
  // dot = (dx * 0) + (dy * -1) = -dy
  const cosAngle = Math.max(-1, Math.min(1, -dy / mag));
  const degrees = (Math.acos(cosAngle) * 180) / Math.PI;

  return Math.round(degrees * 10) / 10;
}

/**
 * Calculates horizontal symmetry ratio between left and right side heights (e.g. shoulders or hips)
 * 1.0 = perfectly level, < 0.85 = notable slant/asymmetry
 */
export function calculateSymmetryRatio(
  leftPoint: LandmarkPoint | null | undefined,
  rightPoint: LandmarkPoint | null | undefined
): number | null {
  if (!leftPoint || !rightPoint) return null;
  const dy = Math.abs(leftPoint.y - rightPoint.y);
  const dx = Math.abs(leftPoint.x - rightPoint.x);
  if (dx < 1e-4) return null;

  // Slant angle from horizontal
  const slantDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  // Score: 100% when slant is 0 deg, decays as slant increases
  const score = Math.max(0, 1 - (slantDeg / 25));
  return Math.round(score * 100) / 100;
}

/**
 * Exponential Moving Average (EMA) smoothing for angle readings
 * alpha = 0.25 provides low-latency smoothing with high responsiveness
 */
export class AngleSmoother {
  private values: Map<string, number> = new Map();
  private alpha: number;

  constructor(alpha: number = 0.3) {
    this.alpha = alpha;
  }

  smooth(key: string, newValue: number | null): number | null {
    if (newValue === null) {
      return this.values.get(key) ?? null;
    }

    const previous = this.values.get(key);
    if (previous === undefined) {
      this.values.set(key, newValue);
      return newValue;
    }

    const smoothed = (this.alpha * newValue) + ((1 - this.alpha) * previous);
    const rounded = Math.round(smoothed * 10) / 10;
    this.values.set(key, rounded);
    return rounded;
  }

  reset(): void {
    this.values.clear();
  }
}
