/**
 * YogaFlow AI - Private Lesson Booking Wizard Modal
 * Validates date, time slots, duration pricing, and prevents scheduling conflicts
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InstructorProfile } from '../types';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Info,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

interface BookingModalProps {
  instructor: InstructorProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  instructor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createBooking } = useApp();

  // Tomorrow's date formatted YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [date, setDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>(instructor.availabilitySlots[0] || '14:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculated price
  const calculatedPrice = Math.round(instructor.hourlyRate * (durationMinutes / 60));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = createBooking(
      instructor.id,
      date,
      timeSlot,
      durationMinutes,
      notes.trim() || undefined
    );

    setIsSubmitting(false);

    if (result.success && result.booking) {
      onSuccess(result.booking.id);
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to request booking.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <img
            src={instructor.avatar}
            alt={instructor.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-violet-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{instructor.name}</h3>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ${instructor.hourlyRate}/hr • {instructor.specialties.slice(0, 2).join(', ')}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Select Date */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session Date</span>
            </label>
            <input
              type="date"
              required
              min={defaultDateStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Select Time Slot */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Available Time Slot</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {instructor.availabilitySlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 rounded-xl font-mono font-bold transition-all ${
                    timeSlot === slot
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30 border border-violet-400'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Lesson Duration</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDurationMinutes(30)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  durationMinutes === 30
                    ? 'bg-violet-950/60 border-violet-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <p className="font-bold">30 Minutes</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Quick form check & corrections</p>
              </button>
              <button
                type="button"
                onClick={() => setDurationMinutes(60)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  durationMinutes === 60
                    ? 'bg-violet-950/60 border-violet-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <p className="font-bold">60 Minutes (Standard)</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Comprehensive private flow session</p>
              </button>
            </div>
          </div>

          {/* Student Focus Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">
              Personal Goals or Focus Area (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Working on Warrior II front knee alignment and hip external rotation..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none text-xs"
            />
          </div>

          {/* Total Price Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs">Total Demo Tuition:</span>
              <p className="text-[10px] text-slate-500">No payment will be charged in demo mode.</p>
            </div>
            <div className="font-mono text-xl font-black text-emerald-400">
              ${calculatedPrice}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-black text-sm tracking-wide shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-2 border border-violet-400"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>Dərsi Sifariş Et və Təsdiqlə</span>
          </button>
        </form>
      </div>
    </div>
  );
};
