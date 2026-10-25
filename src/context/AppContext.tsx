/**
 * YogaFlow AI - Global Application State Context
 * Handles Demo Authentication, LocalStorage persistence, Booking conflict resolution,
 * Instructor Eligibility Engine, and Session history tracking.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  InstructorProfile,
  PracticeSessionRecord,
  LessonBooking,
  InstructorAssessment,
  BookingStatus,
} from '../types';
import {
  INITIAL_STUDENT_USER,
  INITIAL_INSTRUCTOR_USER,
  INITIAL_INSTRUCTORS,
  INITIAL_PRACTICE_SESSIONS,
  INITIAL_BOOKINGS,
} from '../data/mockData';
import { INSTRUCTOR_ASSESSMENT_POSE_IDS } from '../data/poses';

interface AppContextType {
  currentUser: UserAccount;
  activeRole: 'student' | 'instructor';
  switchRole: (role: 'student' | 'instructor') => void;
  updateUserProfile: (updates: Partial<UserAccount>) => void;
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPoseId: string;
  setSelectedPoseId: (id: string) => void;
  // Practice Sessions
  sessions: PracticeSessionRecord[];
  addSession: (session: Omit<PracticeSessionRecord, 'id'>) => PracticeSessionRecord;
  clearAllSessions: () => void;
  exportSessionsAsCSV: () => void;
  // Bookings
  bookings: LessonBooking[];
  createBooking: (
    instructorId: string,
    date: string,
    timeSlot: string,
    durationMinutes: number,
    notes?: string
  ) => { success: boolean; error?: string; booking?: LessonBooking };
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  cancelBooking: (bookingId: string) => void;
  // Instructors & Assessments
  instructors: InstructorProfile[];
  assessments: Record<string, InstructorAssessment>;
  saveAssessmentResult: (
    assessment: Omit<InstructorAssessment, 'id'>
  ) => { passed: boolean; score: number; eligible: boolean };
  // Favorites
  toggleFavoritePose: (poseId: string) => void;
  isPoseFavorite: (poseId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'yogaflow_current_user_v1',
  ACTIVE_ROLE: 'yogaflow_active_role_v1',
  SESSIONS: 'yogaflow_sessions_v1',
  BOOKINGS: 'yogaflow_bookings_v1',
  INSTRUCTORS: 'yogaflow_instructors_v1',
  ASSESSMENTS: 'yogaflow_assessments_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Role & User State
  const [activeRole, setActiveRole] = useState<'student' | 'instructor'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
    return saved === 'instructor' ? 'instructor' : 'student';
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return activeRole === 'instructor' ? INITIAL_INSTRUCTOR_USER : INITIAL_STUDENT_USER;
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPoseId, setSelectedPoseId] = useState<string>('mountain-pose');

  // 3. Sessions State
  const [sessions, setSessions] = useState<PracticeSessionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_PRACTICE_SESSIONS;
  });

  // 4. Bookings State
  const [bookings, setBookings] = useState<LessonBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_BOOKINGS;
  });

  // 5. Instructors State
  const [instructors, setInstructors] = useState<InstructorProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSTRUCTORS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_INSTRUCTORS;
  });

  // 6. Assessments State
  const [assessments, setAssessments] = useState<Record<string, InstructorAssessment>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {};
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSTRUCTORS, JSON.stringify(instructors));
  }, [instructors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  }, [assessments]);

  // Switch role handler
  const switchRole = (role: 'student' | 'instructor') => {
    setActiveRole(role);
    if (role === 'instructor') {
      setCurrentUser(INITIAL_INSTRUCTOR_USER);
    } else {
      setCurrentUser(INITIAL_STUDENT_USER);
    }
  };

  const updateUserProfile = (updates: Partial<UserAccount>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // Add Practice Session
  const addSession = (sessionData: Omit<PracticeSessionRecord, 'id'>): PracticeSessionRecord => {
    const newSession: PracticeSessionRecord = {
      ...sessionData,
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update user stats
    setCurrentUser((prev) => {
      const addedMinutes = Math.round(sessionData.durationSeconds / 60);
      return {
        ...prev,
        weeklyGoalMinutes: Math.max(0, prev.weeklyGoalMinutes - addedMinutes),
        streakDays: prev.streakDays + (sessionData.durationSeconds >= 60 ? 1 : 0),
      };
    });

    return newSession;
  };

  const clearAllSessions = () => {
    setSessions([]);
  };

  const exportSessionsAsCSV = () => {
    if (sessions.length === 0) return;
    const headers = ['Session ID', 'Date', 'Pose Name', 'Sanskrit Name', 'Duration (s)', 'Avg Accuracy (%)', 'Peak Accuracy (%)', 'Calories Burned (kcal)', 'Is Assessment'];
    const rows = sessions.map((s) => [
      s.id,
      s.date,
      `"${s.poseName}"`,
      `"${s.sanskritName}"`,
      s.durationSeconds,
      s.averageAccuracy,
      s.peakAccuracy,
      s.caloriesBurned,
      s.isAssessment ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yogaflow_sessions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Booking system with collision validation
  const createBooking = (
    instructorId: string,
    date: string,
    timeSlot: string,
    durationMinutes: number,
    notes?: string
  ): { success: boolean; error?: string; booking?: LessonBooking } => {
    const instructor = instructors.find((i) => i.id === instructorId);
    if (!instructor) {
      return { success: false, error: 'Selected instructor was not found.' };
    }

    if (!instructor.isEligible) {
      return {
        success: false,
        error: 'This instructor has not yet completed the required pose assessment qualification (score >= 85).',
      };
    }

    // Check for conflicting confirmed/pending booking at the same date and time slot
    const hasConflict = bookings.some(
      (b) =>
        b.instructorId === instructorId &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        (b.status === 'confirmed' || b.status === 'pending')
    );

    if (hasConflict) {
      return {
        success: false,
        error: `Time conflict: ${instructor.name} already has a lesson scheduled at ${timeSlot} on ${date}. Please pick an alternate time.`,
      };
    }

    // Calculate exact pricing based on instructor's rate and duration
    const price = Math.round(instructor.hourlyRate * (durationMinutes / 60));

    const newBooking: LessonBooking = {
      id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      instructorId: instructor.id,
      instructorName: instructor.name,
      instructorAvatar: instructor.avatar,
      date,
      timeSlot,
      durationMinutes,
      price,
      status: 'pending',
      notes,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    return { success: true, booking: newBooking };
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const cancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'cancelled');
  };

  // Instructor Assessment with Strict 85 Eligibility Threshold
  const saveAssessmentResult = (
    assessmentData: Omit<InstructorAssessment, 'id'>
  ): { passed: boolean; score: number; eligible: boolean } => {
    const id = `asmt-${Date.now()}`;
    const score = Math.round(assessmentData.overallScore);

    // Verify all 5 required poses are completed
    const completedPoseIds = Object.keys(assessmentData.poseResults);
    const hasAllRequiredPoses = INSTRUCTOR_ASSESSMENT_POSE_IDS.every((pId) =>
      completedPoseIds.includes(pId)
    );

    // Strict threshold: >= 85 AND all required poses
    const passed = score >= 85 && hasAllRequiredPoses;

    const fullAssessment: InstructorAssessment = {
      ...assessmentData,
      id,
      overallScore: score,
      passed,
    };

    setAssessments((prev) => ({
      ...prev,
      [id]: fullAssessment,
    }));

    // If passed, update current user and instructor list
    if (currentUser.role === 'instructor') {
      setCurrentUser((prev) => ({
        ...prev,
        instructorData: {
          ...prev.instructorData,
          isEligible: passed,
          assessmentScore: score,
          assessmentDate: new Date().toISOString().slice(0, 10),
        },
      }));

      // Update in instructor list as well
      setInstructors((prev) =>
        prev.map((inst) =>
          inst.email === currentUser.email || inst.name === currentUser.name
            ? {
                ...inst,
                isEligible: passed,
                assessmentScore: score,
                assessmentDate: new Date().toISOString().slice(0, 10),
              }
            : inst
        )
      );
    }

    return { passed, score, eligible: passed };
  };

  // Favorites
  const toggleFavoritePose = (poseId: string) => {
    setCurrentUser((prev) => {
      const exists = prev.favoritePoseIds.includes(poseId);
      const updated = exists
        ? prev.favoritePoseIds.filter((id) => id !== poseId)
        : [...prev.favoritePoseIds, poseId];
      return { ...prev, favoritePoseIds: updated };
    });
  };

  const isPoseFavorite = (poseId: string) => {
    return currentUser.favoritePoseIds.includes(poseId);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        updateUserProfile,
        activeTab,
        setActiveTab,
        selectedPoseId,
        setSelectedPoseId,
        sessions,
        addSession,
        clearAllSessions,
        exportSessionsAsCSV,
        bookings,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        instructors,
        assessments,
        saveAssessmentResult,
        toggleFavoritePose,
        isPoseFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
