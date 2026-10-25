/**
 * YogaFlow AI - Student Experience & Progress Dashboard
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { YOGA_POSES } from '../data/poses';
import { PoseIllustration } from './PoseIllustration';
import {
  Activity,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  Heart,
  Play,
  Sparkles,
  TrendingUp,
  UserCheck,
  Video,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    sessions,
    bookings,
    setActiveTab,
    setSelectedPoseId,
    toggleFavoritePose,
    isPoseFavorite,
  } = useApp();

  // Aggregate metrics
  const totalPracticeSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalPracticeMinutes = Math.round(totalPracticeSeconds / 60);
  const totalCalories = sessions.reduce((acc, s) => acc + s.caloriesBurned, 0);
  const averageAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.averageAccuracy, 0) / sessions.length)
    : 0;

  // Weekly goal progress
  const weeklyTargetMinutes = 150;
  const weeklyProgressPercent = Math.min(100, Math.round((totalPracticeMinutes / weeklyTargetMinutes) * 100));

  // Upcoming confirmed/pending bookings
  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');

  // Favorite poses
  const favoritePosesList = YOGA_POSES.filter((p) => currentUser.favoritePoseIds.includes(p.id));

  // Recommended next poses
  const recommendedPoses = YOGA_POSES.slice(0, 4);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-950/60 via-[#0d162a] to-cyan-950/40 border border-slate-800/80 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Welcome back, {currentUser.name}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-800/40">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {currentUser.streakDays} Day Practice Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Elevate Your Form with Computer Vision
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Real-time skeletal tracking detects your joint angles, calculates biomechanical precision, and guides your alignment with zero guesswork.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedPoseId('warrior-2');
                setActiveTab('practice');
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume AI Practice</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700/80 transition-all flex items-center gap-1.5"
            >
              <span>Explore 16 Poses</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Practice Time */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Practice Time</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white">
            {totalPracticeMinutes} <span className="text-xs font-sans text-slate-400 font-normal">min</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Across {sessions.length} tracked pose sessions
          </p>
        </div>

        {/* Avg Form Accuracy */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Pose Accuracy</span>
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white">
            {averageAccuracy}%
          </div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            High biomechanical alignment
          </p>
        </div>

        {/* Estimated Calories */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Estimated Energy</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white">
            {Math.round(totalCalories)} <span className="text-xs font-sans text-slate-400 font-normal">kcal</span>
          </div>
          <p className="text-[11px] text-slate-400">
            ACSM MET-based formula estimate
          </p>
        </div>

        {/* Weekly Goal */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Weekly Goal (150 min)</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white">
            {weeklyProgressPercent}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Sessions & Upcoming Private Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left (2 cols): Recent Practice Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Recent Practice History
            </h2>
            <button
              onClick={() => setActiveTab('progress')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-3">
                <Activity className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm">No practice sessions recorded yet.</p>
                <button
                  onClick={() => setActiveTab('practice')}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs"
                >
                  Start Your First Practice
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 shrink-0">
                        {session.averageAccuracy}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-100 text-sm">{session.poseName}</p>
                          <span className="text-xs text-slate-400 italic">
                            ({session.sanskritName})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(session.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • Duration: {formatDuration(session.durationSeconds)} • {session.caloriesBurned} kcal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setSelectedPoseId(session.poseId);
                          setActiveTab('practice');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold border border-violet-400 shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Məşqə Başla</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favorite Poses Bar */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              Favorite Poses
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {favoritePosesList.slice(0, 4).map((pose) => (
                <div
                  key={pose.id}
                  className="glass-panel p-3.5 rounded-2xl border border-slate-700/80 hover:border-violet-400 transition-all flex flex-col justify-between group shadow-md"
                >
                  <div className="w-full h-24 rounded-xl bg-slate-900/90 flex items-center justify-center mb-2 p-2 border border-slate-800">
                    <PoseIllustration svgType={pose.svgType} className="w-full h-full" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs truncate">{pose.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{pose.sanskritName}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPoseId(pose.id);
                      setActiveTab('practice');
                    }}
                    className="mt-3 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md border border-cyan-400"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Başla</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right (1 col): Upcoming Private Lessons & Instructor Marketplace Prompt */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Upcoming Private Lessons
          </h2>

          <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
            {upcomingBookings.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-3">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">No upcoming private lessons scheduled.</p>
                <button
                  onClick={() => setActiveTab('instructors')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs"
                >
                  Browse Certified Instructors
                </button>
              </div>
            ) : (
              upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/90 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={b.instructorAvatar}
                        alt={b.instructorName}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-violet-500/40"
                      />
                      <div>
                        <p className="font-bold text-slate-100 text-xs">{b.instructorName}</p>
                        <p className="text-[10px] text-slate-400">
                          {b.date} • {b.timeSlot} ({b.durationMinutes} min)
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg">
                      "{b.notes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-mono text-slate-200 font-bold">${b.price}</span>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 border border-violet-400 shadow-sm transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Dərs Otağına Bax</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Instructor Qualification Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-violet-950/60 border border-indigo-700/60 space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Eğitmen Olmaq İstəyirsiniz?</span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed font-medium">
              5 hərəkətlik kompüter görmə imtahanını (minimum 85% bal) tamamlayaraq rəsmi təlimçi statusu qazanın və dərslər satın.
            </p>
            <button
              onClick={() => setActiveTab('assessment')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs tracking-wide border border-indigo-400 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Eğitmen İmtahanına Başla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
