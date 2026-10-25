/**
 * YogaFlow AI - Real-Time Canvas Skeleton & Biomechanical Overlay Renderer
 */

import { LandmarkPoint, MEDIAPIPE_LANDMARKS as LM, VISIBILITY_THRESHOLD } from './geometry';
import { JointAngleMeasurement } from '../types';

export interface RenderOptions {
  showSkeleton: boolean;
  showMarkers: boolean;
  showAngles: boolean;
  showConfidence: boolean;
  isMirrored: boolean;
  cleanMode: boolean;
}

// MediaPipe standard skeletal connection pairs
const SKELETON_CONNECTIONS: Array<[number, number, string]> = [
  // Upper body
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, 'torso'],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, 'leftArm'],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST, 'leftForearm'],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, 'rightArm'],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST, 'rightForearm'],
  // Torso
  [LM.LEFT_SHOULDER, LM.LEFT_HIP, 'leftTorso'],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP, 'rightTorso'],
  [LM.LEFT_HIP, LM.RIGHT_HIP, 'hips'],
  // Lower body
  [LM.LEFT_HIP, LM.LEFT_KNEE, 'leftThigh'],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE, 'leftShin'],
  [LM.LEFT_ANKLE, LM.LEFT_HEEL, 'leftFoot'],
  [LM.LEFT_HEEL, LM.LEFT_FOOT_INDEX, 'leftToes'],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE, 'rightThigh'],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE, 'rightShin'],
  [LM.RIGHT_ANKLE, LM.RIGHT_HEEL, 'rightFoot'],
  [LM.RIGHT_HEEL, LM.RIGHT_FOOT_INDEX, 'rightToes'],
  // Head
  [LM.NOSE, LM.LEFT_SHOULDER, 'neckLeft'],
  [LM.NOSE, LM.RIGHT_SHOULDER, 'neckRight'],
];

export function renderPoseOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  landmarks: LandmarkPoint[] | null,
  jointMeasurements: Record<string, JointAngleMeasurement>,
  options: RenderOptions,
  overallScore: number = 0
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear previous frame
  ctx.clearRect(0, 0, width, height);

  if (options.cleanMode || !landmarks || landmarks.length === 0) {
    return;
  }

  ctx.save();

  // If mirrored, flip horizontally for rendering overlay to match mirrored video
  if (options.isMirrored) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  // 1. Draw Skeleton Lines
  if (options.showSkeleton) {
    for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];

      if (!p1 || !p2) continue;
      const vis1 = p1.visibility ?? 1;
      const vis2 = p2.visibility ?? 1;

      if (vis1 < VISIBILITY_THRESHOLD || vis2 < VISIBILITY_THRESHOLD) {
        continue;
      }

      const x1 = p1.x * width;
      const y1 = p1.y * height;
      const x2 = p2.x * width;
      const y2 = p2.y * height;

      // Determine segment color based on score or default neon cyan
      let strokeColor = '#06b6d4'; // neon cyan
      let glowColor = 'rgba(6, 182, 212, 0.4)';

      if (overallScore >= 85) {
        strokeColor = '#10b981'; // emerald green
        glowColor = 'rgba(16, 185, 129, 0.5)';
      } else if (overallScore >= 65) {
        strokeColor = '#f59e0b'; // amber
        glowColor = 'rgba(245, 158, 11, 0.4)';
      } else if (overallScore > 0) {
        strokeColor = '#ef4444'; // red
        glowColor = 'rgba(239, 68, 68, 0.4)';
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;
      ctx.stroke();
    }
  }

  // 2. Draw Landmark Joint Nodes
  if (options.showMarkers) {
    // Key landmark joints
    const activeNodes = [
      LM.NOSE,
      LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER,
      LM.LEFT_ELBOW, LM.RIGHT_ELBOW,
      LM.LEFT_WRIST, LM.RIGHT_WRIST,
      LM.LEFT_HIP, LM.RIGHT_HIP,
      LM.LEFT_KNEE, LM.RIGHT_KNEE,
      LM.LEFT_ANKLE, LM.RIGHT_ANKLE,
    ];

    for (const idx of activeNodes) {
      const pt = landmarks[idx];
      if (!pt) continue;
      const vis = pt.visibility ?? 1;
      if (vis < VISIBILITY_THRESHOLD) continue;

      const x = pt.x * width;
      const y = pt.y * height;

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(139, 92, 246, 0.4)'; // violet halo
      ctx.fill();

      // Middle ring
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();

      // Core center
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }

  ctx.restore(); // Restore transform before rendering text labels so text is not mirrored!

  // 3. Draw Angle Badges & Biomechanical Measurements
  if (options.showAngles && jointMeasurements) {
    for (const measurement of Object.values(jointMeasurements)) {
      if (!measurement.vertexPoint || measurement.status === 'insufficient_confidence') {
        continue;
      }

      // Compute screen coordinates for vertex label
      let labelX = measurement.vertexPoint.x * width;
      let labelY = measurement.vertexPoint.y * height;

      if (options.isMirrored) {
        labelX = width - labelX;
      }

      // Offset label so it doesn't obstruct joint
      labelX += 16;
      labelY -= 12;

      // Keep inside canvas bounds
      labelX = Math.max(10, Math.min(width - 110, labelX));
      labelY = Math.max(25, Math.min(height - 20, labelY));

      const angleText = `${Math.round(measurement.currentAngle)}°`;
      const targetText = `tgt ${measurement.targetAngle}°`;

      // Status color
      let badgeBg = 'rgba(15, 23, 42, 0.85)';
      let badgeBorder = '#06b6d4';
      let textColor = '#ffffff';

      if (measurement.status === 'optimal') {
        badgeBorder = '#10b981';
      } else if (measurement.status === 'moderate') {
        badgeBorder = '#f59e0b';
      } else if (measurement.status === 'deviated') {
        badgeBorder = '#ef4444';
      }

      ctx.save();
      ctx.font = '600 12px "JetBrains Mono", monospace';
      const textMetrics = ctx.measureText(angleText);
      const boxWidth = Math.max(68, textMetrics.width + 36);
      const boxHeight = 24;

      // Draw rounded badge background
      ctx.fillStyle = badgeBg;
      ctx.strokeStyle = badgeBorder;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(labelX, labelY - 16, boxWidth, boxHeight, 6);
      ctx.fill();
      ctx.stroke();

      // Status indicator dot
      ctx.beginPath();
      ctx.arc(labelX + 9, labelY - 4, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = badgeBorder;
      ctx.fill();

      // Angle text
      ctx.fillStyle = textColor;
      ctx.fillText(angleText, labelX + 18, labelY);

      // Subtitle target badge if space allows
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(targetText, labelX + boxWidth - 34, labelY);

      ctx.restore();
    }
  }
}
