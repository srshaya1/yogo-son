/**
 * YogaFlow AI - Certified Instructor Marketplace
 * Displays only verified instructors who passed the 85% assessment threshold
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InstructorProfile } from '../types';
import { BookingModal } from './BookingModal';
import {
  Award,
  Calendar,
  CheckCircle2,
  DollarSign,
  Filter,
  GraduationCap,
  Languages,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
} from 'lucide-react';

export const InstructorMarketplace: React.FC = () => {
  const { instructors, setActiveTab } = useApp();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(100);

  // Booking Modal
  const [selectedInstructorForBooking, setSelectedInstructorForBooking] = useState<InstructorProfile | null>(null);
  const [bookingSuccessId, setBookingSuccessId] = useState<string | null>(null);

  // Strictly filter instructors: MUST be eligible (passed assessment >= 85)
  const verifiedEligibleInstructors = instructors.filter((inst) => inst.isEligible);

  // Extract all unique specialties and languages from eligible instructors
  const allSpecialties = Array.from(
    new Set(verifiedEligibleInstructors.flatMap((i) => i.specialties))
  );
  const allLanguages = Array.from(
    new Set(verifiedEligibleInstructors.flatMap((i) => i.languages))
  );

  // Filtered instructors list
  const filteredInstructors = verifiedEligibleInstructors.filter((inst) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inst.name.toLowerCase().includes(q);
      const matchBio = inst.bio.toLowerCase().includes(q);
      const matchSpec = inst.specialties.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchSpec) return false;
    }

    if (selectedSpecialty !== 'all' && !inst.specialties.includes(selectedSpecialty)) {
      return false;
    }

    if (selectedLanguage !== 'all' && !inst.languages.includes(selectedLanguage)) {
      return false;
    }

    if (inst.hourlyRate > maxPrice) {
      return false;
    }

    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/70 via-[#0b1222] to-violet-950/50 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict MediaPipe Vision Quality Standard (≥ 85%)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Book 1-on-1 Lessons with Certified Masters
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Every instructor in this marketplace has passed our comprehensive 5-pose biomechanical tracking assessment. Book personalized private video sessions to advance your practice.
          </p>
        </div>

        {/* Action to take assessment */}
        <div className="relative z-10 pt-4 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('assessment')}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black border border-violet-400 text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-cyan-300" />
            <span>Eğitmen İmtahanına Get (≥ 85%)</span>
          </button>
        </div>
      </div>

      {/* Success Booking Banner */}
      {bookingSuccessId && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Booking request confirmed! Your instructor will review your lesson goals. View booking details in your Bookings tab.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('bookings')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
          >
            View Bookings
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by instructor name, specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="all">All Specialties</option>
            {allSpecialties.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="all">All Languages</option>
            {allLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Price Range Slider */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700/80">
            <span className="text-slate-400 shrink-0 font-medium">Max:</span>
            <input
              type="range"
              min={40}
              max={120}
              step={5}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <span className="font-mono font-bold text-slate-200 shrink-0">${maxPrice}/hr</span>
          </div>
        </div>

        {/* Results count & active filters feedback */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Showing {filteredInstructors.length} verified yoga masters</span>
          <span>Only instructors with ≥ 85% certified score appear</span>
        </div>
      </div>

      {/* Instructors Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructors.map((inst) => (
          <div
            key={inst.id}
            className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-5 group"
          >
            {/* Top Avatar & Rating */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={inst.avatar}
                    alt={inst.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-violet-500/30 group-hover:ring-violet-500/60 transition-all"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{inst.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{inst.yearsExperience} yrs teaching experience</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs justify-end">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{inst.rating}</span>
                    <span className="text-slate-500 text-[10px]">({inst.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Assessment Score Badge */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Form Assessment
                </span>
                <span className="font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {inst.assessmentScore}% Verified
                </span>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {inst.bio}
              </p>

              {/* Specialties Pills */}
              <div className="flex flex-wrap gap-1.5">
                {inst.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-violet-950/50 text-violet-300 border border-violet-800/40"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Languages className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px]">{inst.languages.join(', ')}</span>
              </div>
            </div>

            {/* Bottom Tuition & Booking Button */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">Hourly Tuition</span>
                <p className="text-xl font-black font-mono text-white">
                  ${inst.hourlyRate}
                  <span className="text-xs font-sans text-slate-400 font-normal">/hr</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedInstructorForBooking(inst)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs tracking-wide shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2 border border-violet-400"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dərs Sifariş Et</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Wizard Modal */}
      {selectedInstructorForBooking && (
        <BookingModal
          instructor={selectedInstructorForBooking}
          isOpen={true}
          onClose={() => setSelectedInstructorForBooking(null)}
          onSuccess={(id) => {
            setBookingSuccessId(id);
            setSelectedInstructorForBooking(null);
          }}
        />
      )}
    </div>
  );
};
