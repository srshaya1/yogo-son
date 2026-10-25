/**
 * YogaFlow AI - Structured Scientific & Educational References
 * Grounded literature citations for biomechanics, kinesiology, and MET energy research
 */

import React from 'react';
import { EDUCATIONAL_REFERENCES } from '../data/mockData';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  FileCheck,
  GraduationCap,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const EducationalReferencesView: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            Literature & Scientific Grounding
          </span>
          <span className="text-xs text-slate-400">Peer-Reviewed Kinesiology</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
          Biomechanical Research & Citations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
          YogaFlow AI's pose criteria and energy estimations are structured upon published kinematic research, anatomical references, and ACSM metabolic expenditure models.
        </p>
      </div>

      {/* Boundary disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200">Educational Boundary Notice:</strong> External scientific citations are maintained as a local structured dataset separate from live camera computer-vision calculations. Camera tracking does not query external APIs at runtime, ensuring robust offline-capable local execution and absolute user privacy.
        </div>
      </div>

      {/* Reference Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EDUCATIONAL_REFERENCES.map((ref) => (
          <div
            key={ref.id}
            className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                  {ref.relevantPoseOrTopic}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Accessed: {ref.accessDate}
                </span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">
                {ref.title}
              </h3>

              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                <span>{ref.organization}</span>
              </p>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {ref.summary}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>View Source Citation</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
