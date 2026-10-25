/**
 * YogaFlow AI - Navigation Header & Command Center
 * High-contrast, symmetric, and clearly visible buttons with simplified profile & instructor login
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SimpleAuthProfileModal } from './SimpleAuthProfileModal';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  Compass,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  Video,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenPositioningGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPositioningGuide }) => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    currentUser,
    bookings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  const mainNavItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'AI Practice', icon: Activity, highlight: true },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'instructors', label: 'Marketplace', icon: Compass },
    {
      id: 'assessment',
      label: 'Instructor Assessment',
      icon: Award,
      badge: activeRole === 'instructor' && !currentUser.instructorData?.isEligible ? '85%' : undefined,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      countBadge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    { id: 'progress', label: 'Analytics', icon: TrendingUp },
    { id: 'tests', label: 'Tests', icon: ShieldCheck },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-700/80 bg-[#0c1222] shadow-xl transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
                <div className="w-full h-full bg-[#0b1020] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">
                    YogaFlow
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-black tracking-wider rounded bg-violet-600 text-white shadow-xs">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  Biomechanical Vision
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation - Clean, high contrast, symmetric */}
          <nav className="hidden xl:flex items-center gap-1.5">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/40 border border-violet-400'
                        : 'bg-slate-800 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : item.highlight
                      ? 'bg-violet-950/70 text-violet-200 hover:text-white hover:bg-violet-900 border border-violet-500/40'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (item.highlight ? 'text-white' : 'text-cyan-400') : 'text-slate-300'}`} />
                  <span>{item.label}</span>
                  {item.countBadge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-400 text-slate-950 shadow-sm">
                      {item.countBadge}
                    </span>
                  )}
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons: Setup, Profile & Simplified Login */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Camera Setup Button (Visible on tablet & desktop) */}
            <button
              onClick={onOpenPositioningGuide}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 border border-slate-600 rounded-xl transition-all shadow-sm"
              title="Kamera bələdçisi / Camera Setup"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>Kamera Setup</span>
            </button>

            {/* Simplified Profile & Role Entry Button */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-600 hover:border-violet-400 text-white transition-all shadow-md group"
              title="Profil redaktəsi və Eğitmen Girişi"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-400"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-slate-900 ${
                    activeRole === 'instructor' ? 'bg-indigo-500' : 'bg-emerald-400'
                  }`}
                />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white leading-tight">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                      activeRole === 'instructor'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-violet-600 text-white'
                    }`}
                  >
                    {activeRole === 'instructor' ? 'Eğitmen' : 'Tələbə'}
                  </span>
                </div>
                <p className="text-[10px] text-cyan-300 group-hover:text-cyan-200 font-medium">
                  Profil & Giriş
                </p>
              </div>
            </button>

            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Drawer Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-700 bg-[#0c1222] px-4 pt-3 pb-5 space-y-1.5 shadow-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-violet-600 text-white border-violet-400 shadow-md'
                        : 'bg-slate-805 text-slate-200 hover:bg-slate-750 border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.countBadge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                        {item.countBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Camera Setup in Mobile Menu */}
            <div className="pt-2 border-t border-slate-700/80 flex gap-2">
              <button
                onClick={() => {
                  onOpenPositioningGuide();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600"
              >
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Kamera Bələdçisi</span>
              </button>

              <button
                onClick={() => {
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-400"
              >
                <User className="w-4 h-4" />
                <span>Profil & Eğitmen Girişi</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Simplified Profile & Auth Modal */}
      <SimpleAuthProfileModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};
