/**
 * YogaFlow AI - Core Type Definitions
 */

export type PoseCategory = 'standing' | 'balance' | 'inversion' | 'seated' | 'restorative' | 'core';
export type PoseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface AngleCriterion {
  jointKey: string;
  name: string;
  landmarkIndices: [number, number, number]; // [A, B, C] where B is vertex
  targetAngle: number;
  tolerance: number; // +/- tolerance in degrees
  weight: number; // importance weight (0 to 1)
  correctiveTooLow: string;
  correctiveTooHigh: string;
}

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  category: PoseCategory;
  difficulty: PoseDifficulty;
  shortDescription: string;
  fullDescription: string;
  targetCharacteristic: string;
  relevantLandmarks: number[]; // MediaPipe landmark indices
  angleCriteria: AngleCriterion[];
  scoringWeights: {
    jointAngles: number; // typically ~0.40
    majorAlignment: number; // typically ~0.25
    poseSpecific: number; // typically ~0.20
    symmetryStability: number; // typically ~0.15
  };
  commonMistakes: string[];
  stepByStepInstructions: string[];
  safetyGuidance: string[];
  targetMuscles: string[];
  recommendedHoldSeconds: number;
  metValue: number; // Metabolic Equivalent of Task for calorie calc
  svgType: string;
}

export interface JointAngleMeasurement {
  currentAngle: number;
  targetAngle: number;
  tolerance: number;
  deviation: number;
  score: number; // 0 - 100
  status: 'optimal' | 'moderate' | 'deviated' | 'insufficient_confidence';
  label: string;
  feedback: string;
  vertexPoint: { x: number; y: number } | null;
}

export interface LivePoseAnalysis {
  isTracking: boolean;
  trackingConfidence: number; // 0 - 1
  isSufficientConfidence: boolean;
  overallScore: number; // 0 - 100
  categoryScores: {
    jointAngles: number;
    majorAlignment: number;
    poseSpecific: number;
    symmetryStability: number;
  };
  jointMeasurements: Record<string, JointAngleMeasurement>;
  feedbackMessages: string[];
  primaryError: string | null;
  torsoInclination: number;
  symmetryRatio: number;
  validLandmarksCount: number;
}

export interface PracticeSessionRecord {
  id: string;
  userId: string;
  poseId: string;
  poseName: string;
  sanskritName: string;
  date: string; // ISO
  durationSeconds: number;
  averageAccuracy: number;
  peakAccuracy: number;
  caloriesBurned: number;
  isAssessment: boolean;
  feedbackSummary: string[];
}

export interface AssessmentPoseResult {
  poseId: string;
  poseName: string;
  score: number;
  passed: boolean;
  completedAt: string;
  durationSeconds: number;
  confidenceAverage: number;
}

export interface InstructorAssessment {
  id: string;
  instructorId: string;
  instructorName: string;
  date: string;
  overallScore: number;
  passed: boolean; // strictly >= 85
  poseResults: Record<string, AssessmentPoseResult>;
  strengths: string[];
  improvements: string[];
}

export interface InstructorProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  specialties: string[];
  yearsExperience: number;
  languages: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  availabilitySlots: string[]; // e.g. "09:00", "11:00", "14:00", "16:00", "18:00"
  isEligible: boolean; // Requires assessment >= 85
  assessmentScore?: number;
  assessmentDate?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export interface LessonBooking {
  id: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "14:00"
  durationMinutes: number; // 30 or 60
  price: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  role: 'student' | 'instructor';
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  weightKg: number; // For MET calculations
  weeklyGoalMinutes: number;
  streakDays: number;
  favoritePoseIds: string[];
  // Instructor specific
  instructorData?: Partial<InstructorProfile>;
}

export interface EducationalReference {
  id: string;
  title: string;
  organization: string;
  url: string;
  relevantPoseOrTopic: string;
  summary: string;
  accessDate: string;
}
