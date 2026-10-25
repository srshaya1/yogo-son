/**
 * YogaFlow AI - Comprehensive 16-Pose Yoga Library
 * Searchable, filterable directory with in-depth biomechanical criteria and quick AI launch
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YOGA_POSES } from '../data/poses';
import { YogaPose } from '../types';
import { PoseIllustration } from './PoseIllustration';
import {
  Activity,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  Heart,
  Info,
  Play,
  Search,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';

export const YogaLibrary: React.FC = () => {
  const { setSelectedPoseId, setActiveTab, toggleFavoritePose, isPoseFavorite } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [activeModalPose, setActiveModalPose] = useState<YogaPose | null>(null);

  const categories = ['all', 'standing', 'balance', 'inversion', 'seated', 'core', 'restorative'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredPoses = YOGA_POSES.filter((pose) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pose.name.toLowerCase().includes(q);
      const matchSanskrit = pose.sanskritName.toLowerCase().includes(q);
      const matchDesc = pose.shortDescription.toLowerCase().includes(q);
      if (!matchName && !matchSanskrit && !matchDesc) return false;
    }

    if (selectedCategory !== 'all' && pose.category !== selectedCategory) {
      return false;
    }

    if (selectedDifficulty !== 'all' && pose.difficulty !== selectedDifficulty) {
      return false;
    }

    return true;
  });

  const handleStartPractice = (poseId: string) => {
    setSelectedPoseId(poseId);
    setActiveTab('practice');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Curated Asana Dataset
            </span>
            <span className="text-xs text-slate-400">16 Poses Configured</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Pose Anatomy & Kinematic Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Explore step-by-step anatomical guides, joint angular tolerance criteria, and launch real-time AI computer vision practice for each posture.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by English or Sanskrit name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 capitalize font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 capitalize font-medium focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff === 'all' ? 'All Difficulties' : diff}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Found {filteredPoses.length} postures</span>
          <span>Click any card for full kinetic breakdown</span>
        </div>
      </div>

      {/* Poses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPoses.map((pose) => {
          const isFav = isPoseFavorite(pose.id);

          return (
            <div
              key={pose.id}
              className="glass-panel rounded-3xl p-5 border border-slate-800/90 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-4 group relative"
            >
              {/* Favorite Heart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoritePose(pose.id);
                }}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-10 ${
                  isFav
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-900/80 text-slate-500 hover:text-white border border-slate-800'
                }`}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              </button>

              <div className="space-y-3">
                {/* SVG Silhouette Display */}
                <div
                  onClick={() => setActiveModalPose(pose)}
                  className="w-full h-44 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1020] border border-slate-800/90 flex items-center justify-center p-3 cursor-pointer group-hover:scale-[1.02] transition-transform"
                >
                  <PoseIllustration svgType={pose.svgType} className="w-full h-full" />
                </div>

                {/* Name & Sanskrit */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {pose.difficulty}
                    </span>
                    <span className="text-[10px] text-cyan-400 capitalize">
                      {pose.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                    {pose.name}
                  </h3>
                  <p className="text-xs text-slate-400 italic mt-0.5">
                    {pose.sanskritName}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {pose.shortDescription}
                </p>

                {/* Criteria Count & MET */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-violet-400" />
                    {pose.angleCriteria.length} Angle Rules
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {pose.metValue} METs
                  </span>
                </div>
              </div>

              {/* Action Buttons with high contrast and symmetry */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  onClick={() => setActiveModalPose(pose)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-all text-center"
                >
                  Ətraflı Bax
                </button>
                <button
                  onClick={() => handleStartPractice(pose.id)}
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs shadow-md shadow-violet-600/30 flex items-center justify-center gap-1.5 transition-all border border-violet-400"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Məşq Et</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Pose Breakdown Modal */}
      {activeModalPose && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalPose(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-full sm:w-48 h-48 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1222] border border-slate-800 p-3 shrink-0 flex items-center justify-center">
                <PoseIllustration svgType={activeModalPose.svgType} className="w-full h-full" />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {activeModalPose.difficulty}
                  </span>
                  <span className="text-xs text-cyan-400 capitalize">
                    {activeModalPose.category}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white">{activeModalPose.name}</h2>
                <p className="text-sm text-slate-400 italic">{activeModalPose.sanskritName}</p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {activeModalPose.fullDescription}
                </p>
              </div>
            </div>

            {/* Target Criteria */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Biomechanical Joint Angles Evaluated</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeModalPose.angleCriteria.map((c: any) => (
                  <div key={c.jointKey} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex justify-between font-medium text-slate-200">
                      <span>{c.name}</span>
                      <span className="font-mono text-cyan-300 font-bold">{c.targetAngle}° (±{c.tolerance}°)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{c.correctiveTooLow}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions & Common Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">Execution Steps:</h4>
                <ol className="space-y-1.5 text-slate-300 list-decimal list-inside text-[11px]">
                  {activeModalPose.stepByStepInstructions.map((s: string, i: number) => (
                    <li key={i} className="leading-relaxed">{s}</li>
                  ))}
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-amber-300">Common Mistakes:</h4>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  {activeModalPose.commonMistakes.map((m: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-amber-500">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => {
                handleStartPractice(activeModalPose.id);
                setActiveModalPose(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 hover:brightness-110 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Pose Practice in AI Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
