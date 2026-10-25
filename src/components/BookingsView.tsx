/**
 * YogaFlow AI - Private Lessons & Booking Management View
 * Handles student reservations, instructor incoming request accept/decline, and launching virtual classrooms
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LessonBooking } from '../types';
import { LessonRoom } from './LessonRoom';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  User,
  Video,
  X,
  XCircle,
} from 'lucide-react';

export const BookingsView: React.FC = () => {
  const {
    currentUser,
    activeRole,
    bookings,
    updateBookingStatus,
    cancelBooking,
    setActiveTab,
  } = useApp();

  const [activeClassroomBooking, setActiveClassroomBooking] = useState<LessonBooking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter bookings based on current user role
  const relevantBookings = bookings.filter((b) => {
    if (activeRole === 'instructor') {
      return b.instructorId === currentUser.id || b.instructorName === currentUser.name;
    }
    return b.studentId === currentUser.id || b.studentName === currentUser.name;
  });

  const filteredBookings = relevantBookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {activeRole === 'instructor' ? 'Instructor Portal' : 'Student Schedule'}
            </span>
            <span className="text-xs text-slate-400">
              {relevantBookings.length} total lessons
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Private 1-on-1 Lesson Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {activeRole === 'instructor'
              ? 'Manage incoming booking requests from students, approve lesson times, and enter live classrooms.'
              : 'Review your upcoming private consultations, monitor request status, and join video lessons.'}
          </p>
        </div>

        {activeRole === 'student' && (
          <button
            onClick={() => setActiveTab('instructors')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs tracking-wide shadow-lg shadow-violet-600/30 flex items-center gap-2 self-start sm:self-center transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Find Certified Instructors</span>
          </button>
        )}
      </div>

      {/* Filter Tabs - Symmetric with clear borders */}
      <div className="flex items-center gap-2 border-b border-slate-700 pb-3 overflow-x-auto text-xs">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl capitalize font-bold transition-all border ${
              filterStatus === st
                ? 'bg-violet-600 text-white border-violet-400 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
            }`}
          >
            {st === 'all' ? 'Bütün Dərslər' : st}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeRole === 'instructor'
              ? 'You have no incoming lesson requests matching this status filter.'
              : 'You have not scheduled any private lessons yet. Explore our verified instructors to request a session.'}
          </p>
          {activeRole === 'student' && (
            <button
              onClick={() => setActiveTab('instructors')}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors"
            >
              Browse Instructor Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="glass-panel rounded-3xl p-5 border border-slate-800/90 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.instructorAvatar}
                      alt={b.instructorName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-violet-500/30"
                    />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        {activeRole === 'instructor' ? 'Student: ' : 'Instructor: '}
                        <strong className="text-white">
                          {activeRole === 'instructor' ? b.studentName : b.instructorName}
                        </strong>
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{b.date}</span>
                        <span className="text-slate-600">•</span>
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{b.timeSlot} ({b.durationMinutes} min)</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : b.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : b.status === 'declined' || b.status === 'cancelled'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {b.notes && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Focus Goal Notes
                    </span>
                    <p className="italic leading-relaxed">{b.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons & Tuition */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Session Tuition</span>
                  <p className="font-mono font-black text-emerald-400 text-base">${b.price}</p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Instructor Actions for Pending */}
                  {activeRole === 'instructor' && b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(b.id, 'confirmed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md border border-emerald-400"
                      >
                        <Check className="w-4 h-4" />
                        <span>Təsdiq Et</span>
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b.id, 'declined')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-md border border-rose-400"
                      >
                        <X className="w-4 h-4" />
                        <span>İmtina Et</span>
                      </button>
                    </>
                  )}

                  {/* Student Action for Pending: Cancel */}
                  {activeRole === 'student' && b.status === 'pending' && (
                    <button
                      onClick={() => cancelBooking(b.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold border border-slate-600 transition-all shadow-sm"
                    >
                      Sorğunu Ləğv Et
                    </button>
                  )}

                  {/* Launch Video Classroom for Confirmed */}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => setActiveClassroomBooking(b)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:brightness-110 text-white font-black flex items-center gap-2 shadow-lg shadow-violet-600/30 transition-all border border-cyan-400"
                    >
                      <Video className="w-4 h-4" />
                      <span>Dərs Otağına Daxil Ol</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Virtual Lesson Room Active Modal */}
      {activeClassroomBooking && (
        <LessonRoom
          booking={activeClassroomBooking}
          onExit={() => setActiveClassroomBooking(null)}
        />
      )}
    </div>
  );
};
