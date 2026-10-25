/**
 * YogaFlow AI - MediaPipe PoseLandmarker Service
 * Manages vision models, wasm assets, frame detection, and camera streaming
 */

import { FilesetResolver, PoseLandmarker, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { LandmarkPoint } from './geometry';

class MediaPipeService {
  private landmarker: PoseLandmarker | null = null;
  private isInitializing = false;
  private initError: string | null = null;

  async initialize(): Promise<PoseLandmarker> {
    if (this.landmarker) return this.landmarker;

    if (this.isInitializing) {
      // Wait for existing initialization to resolve
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.landmarker) return this.landmarker;
      throw new Error(this.initError || 'Failed to initialize PoseLandmarker');
    }

    this.isInitializing = true;
    this.initError = null;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Attempt with GPU first, fallback to CPU if GPU delegate is unavailable
      try {
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuErr) {
        console.warn('GPU delegate failed for PoseLandmarker, falling back to CPU:', gpuErr);
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      return this.landmarker;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load MediaPipe pose landmarker assets';
      this.initError = msg;
      throw new Error(msg);
    } finally {
      this.isInitializing = false;
    }
  }

  detectVideoFrame(videoElement: HTMLVideoElement, timestampMs: number): LandmarkPoint[] | null {
    if (!this.landmarker || videoElement.readyState < 2) {
      return null;
    }

    try {
      const result: PoseLandmarkerResult = this.landmarker.detectForVideo(videoElement, timestampMs);
      if (result.landmarks && result.landmarks.length > 0) {
        return result.landmarks[0] as LandmarkPoint[];
      }
      return null;
    } catch (err) {
      // In case timestamps are non-monotonic during rapid re-mounts
      return null;
    }
  }

  isLoaded(): boolean {
    return this.landmarker !== null;
  }

  destroy(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch (e) {
        // ignore
      }
      this.landmarker = null;
    }
  }
}

export const mediaPipeService = new MediaPipeService();
