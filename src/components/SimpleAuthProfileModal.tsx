/**
 * YogaFlow AI - Simplified Profile & Instructor Access Modal
 * Clean, symmetric, high-contrast account management and role switcher
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  GraduationCap,
  Mail,
  Scale,
  ShieldCheck,
  Target,
  User,
  UserCheck,
  X,
} from 'lucide-react';

interface SimpleAuthProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleAuthProfileModal: React.FC<SimpleAuthProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    activeRole,
    switchRole,
    updateUserProfile,
    setActiveTab,
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [weightKg, setWeightKg] = useState(currentUser.weightKg || 65);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(currentUser.weeklyGoalMinutes || 150);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      weightKg: Number(weightKg) || 65,
      weeklyGoalMinutes: Number(weeklyGoalMinutes) || 150,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleRoleSelect = (role: 'student' | 'instructor') => {
    switchRole(role);
    if (role === 'instructor') {
      setName('Aria Vance');
      setEmail('aria.vance@yogaflow.ai');
    } else {
      setName('Elena Rostova');
      setEmail('elena.rostova@yogaflow.ai');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1628] w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          title="Bağla / Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-violet-500/50 shadow-md"
            />
            <span
              className={`absolute -bottom-1 -right-1 p-1 rounded-full text-white text-[10px] ${
                activeRole === 'instructor' ? 'bg-indigo-600' : 'bg-violet-600'
              }`}
            >
              {activeRole === 'instructor' ? (
                <UserCheck className="w-3.5 h-3.5" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5" />
              )}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Profil və Giriş
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Rol seçin və məlumatlarınızı sadə formada yeniləyin
            </p>
          </div>
        </div>

        {/* Quick Role Switcher (Student vs Instructor) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Hesab Növü (Rol Seçimi)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Student Button */}
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                activeRole === 'student'
                  ? 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-bold text-sm">Tələbə Girişi</span>
              <span className="text-[10px] opacity-80">Məşq & Dərs Al</span>
            </button>

            {/* Instructor Button */}
            <button
              type="button"
              onClick={() => handleRoleSelect('instructor')}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                activeRole === 'instructor'
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-bold text-sm">Eğitmen Girişi</span>
              <span className="text-[10px] opacity-80">Dərs Ver & İmtahan</span>
            </button>
          </div>
        </div>

        {/* Instructor Certification Alert if Instructor Role */}
        {activeRole === 'instructor' && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-500/50 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-indigo-200">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {currentUser.instructorData?.isEligible
                  ? 'Eğitmen statusu: Təsdiqlənib (≥ 85%)'
                  : 'Eğitmen imtahanını tamamlayaraq təsdiq qazanın'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveTab('assessment');
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs whitespace-nowrap shadow-sm"
            >
              İmtahana Get
            </button>
          </div>
        )}

        {/* Simple Profile Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ad və Soyad</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>E-poçt Ünvanı</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
            />
          </div>

          {/* Weight & Goal (Symmetric Grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Çəki (kq - Kalori üçün)</span>
              </label>
              <input
                type="number"
                min={30}
                max={200}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Həftəlik Hədəf (dəq)</span>
              </label>
              <input
                type="number"
                min={15}
                max={1000}
                step={15}
                value={weeklyGoalMinutes}
                onChange={(e) => setWeeklyGoalMinutes(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Save Action Button with Clear Symmetry */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 border border-violet-400"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>Yadda Saxlanıldı!</span>
                </>
              ) : (
                <span>Yadda Saxla və Davam Et</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
