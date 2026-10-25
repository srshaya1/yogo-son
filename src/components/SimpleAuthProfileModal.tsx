/**
 * YogaFlow AI - Simplified Profile, Custom User Creation & Photo Upload Modal
 * Allows uploading real photos from device, switching roles, and creating custom user profiles
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { DEFAULT_AVATARS } from '../data/mockData';
import {
  Award,
  Camera,
  CheckCircle2,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  PlusCircle,
  RotateCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  User,
  UserCheck,
  UserPlus,
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
    updateUserAvatar,
    createNewUser,
    resetUserData,
    setActiveTab,
  } = useApp();

  // Mode: 'edit' or 'create'
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [selectedRole, setSelectedRole] = useState<'student' | 'instructor'>(activeRole);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
  const [weightKg, setWeightKg] = useState(currentUser.weightKg || 65);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(currentUser.weeklyGoalMinutes || 120);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle image upload from user device (Computer or Phone)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          updateUserAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save current profile changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || currentUser.name,
      email: email.trim() || currentUser.email,
      avatar: avatarUrl,
      weightKg: Number(weightKg) || 65,
      weeklyGoalMinutes: Number(weeklyGoalMinutes) || 120,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  // Create new user profile from scratch
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    createNewUser({
      name: name.trim() || 'Yeni İstifadəçi',
      email: email.trim() || 'istifadeci@yogaflow.ai',
      role: selectedRole,
      avatar: avatarUrl,
      weightKg: Number(weightKg) || 65,
      weeklyGoalMinutes: Number(weeklyGoalMinutes) || 120,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  // Reset to clean slate
  const handleResetData = () => {
    if (window.confirm('Bütün keçmiş sınaq məşqləri və rezervasiyaları silinsin?')) {
      resetUserData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0c1222] w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
          title="Bağla / Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher: Profil Redaktəsi vs Yeni İstifadəçi Yarat */}
        <div className="flex items-center gap-2 border-b border-slate-700 pb-3 pr-10">
          <button
            type="button"
            onClick={() => setModalMode('edit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              modalMode === 'edit'
                ? 'bg-violet-600 text-white border-violet-400 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            Profil Redaktəsi
          </button>
          <button
            type="button"
            onClick={() => {
              setModalMode('create');
              setName('');
              setEmail('');
              setAvatarUrl(DEFAULT_AVATARS[2]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              modalMode === 'create'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yeni İstifadəçi Yarat</span>
          </button>
        </div>

        {/* Profile Avatar & Photo Upload Section */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Profil Şəkli</span>
            </span>
            <span className="text-[11px] text-slate-400">Şəkil yüklə və ya seç</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Clickable Avatar with Camera Overlay */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl overflow-hidden ring-3 ring-violet-500/60 cursor-pointer group shrink-0 shadow-lg"
              title="Şəkli dəyişmək üçün klikləyin"
            >
              <img
                src={avatarUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity text-[10px] font-bold">
                <Upload className="w-5 h-5 mb-0.5" />
                <span>Yüklə</span>
              </div>
            </div>

            {/* Hidden Real File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Action buttons & presets */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs border border-violet-400 shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Cihazdan Şəkil Yüklə</span>
              </button>
              <p className="text-[10px] text-slate-400">JPG, PNG və ya WebP formatı</p>

              {/* Avatar Preset Grid */}
              <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                {DEFAULT_AVATARS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setAvatarUrl(preset);
                      updateUserAvatar(preset);
                    }}
                    className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform ${
                      avatarUrl === preset ? 'border-cyan-400 scale-110 shadow-sm' : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role Switcher (Student vs Instructor) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
            Hesab Növü (Rol)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('student');
                if (modalMode === 'edit') switchRole('student');
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                (modalMode === 'edit' ? activeRole === 'student' : selectedRole === 'student')
                  ? 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span className="font-bold text-xs">Tələbə Girişi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('instructor');
                if (modalMode === 'edit') switchRole('instructor');
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                (modalMode === 'edit' ? activeRole === 'instructor' : selectedRole === 'instructor')
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span className="font-bold text-xs">Eğitmen Girişi</span>
            </button>
          </div>
        </div>

        {/* Form Fields: Name, Email, Weight, Goal */}
        <form
          onSubmit={modalMode === 'create' ? handleCreateNewUser : handleSaveEdit}
          className="space-y-3.5 text-xs"
        >
          {/* Name */}
          <div className="space-y-1">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ad və Soyad</span>
            </label>
            <input
              type="text"
              required
              placeholder="Məs: Cavid Əliyev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>E-poçt Ünvanı</span>
            </label>
            <input
              type="email"
              required
              placeholder="Məs: cavid@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
            />
          </div>

          {/* Weight & Goal (Symmetric Grid) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>Çəki (kq)</span>
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

            <div className="space-y-1">
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

          {/* Save / Create Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl text-white font-black text-sm tracking-wide shadow-xl transition-all flex items-center justify-center gap-2 border ${
                modalMode === 'create'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 border-cyan-400 shadow-cyan-600/30'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-violet-400 shadow-violet-600/30'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>{modalMode === 'create' ? 'Yeni İstifadəçi Yaradıldı!' : 'Yadda Saxlanıldı!'}</span>
                </>
              ) : (
                <span>{modalMode === 'create' ? 'İstifadəçini Yarat və Başla' : 'Məlumatları Yadda Saxla'}</span>
              )}
            </button>
          </div>
        </form>

        {/* Clean Slate / Reset Data Footer Option */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Köhnə test qeydlərini təmizləmək:</span>
          <button
            type="button"
            onClick={handleResetData}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetSuccess ? 'Sıfırlandı!' : 'Məşqləri Sıfırla'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
