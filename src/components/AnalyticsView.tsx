/**
 * YogaFlow AI - Biomechanical Analytics & Progress Tracking
 * Visualizes accuracy trends, session frequencies, pose breakdowns, and CSV export
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YOGA_POSES } from '../data/poses';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Info,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { sessions, exportSessionsAsCSV } = useApp();

  const [dateRangeFilter, setDateRangeFilter] = useState<'7d' | '30d' | 'all'>('30d');

  // Compute metrics
  const totalSessions = sessions.length;
  const totalSeconds = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalCalories = Math.round(sessions.reduce((acc, s) => acc + s.caloriesBurned, 0));

  const averageAccuracy = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.averageAccuracy, 0) / totalSessions)
    : 0;

  const peakAccuracy = totalSessions > 0
    ? Math.max(...sessions.map((s) => s.peakAccuracy || s.averageAccuracy))
    : 0;

  // Breakdown by pose
  const poseStatsMap: Record<string, { count: number; totalScore: number; peak: number; name: string }> = {};

  sessions.forEach((s) => {
    if (!poseStatsMap[s.poseId]) {
      poseStatsMap[s.poseId] = {
        count: 0,
        totalScore: 0,
        peak: 0,
        name: s.poseName,
      };
    }
    poseStatsMap[s.poseId].count++;
    poseStatsMap[s.poseId].totalScore += s.averageAccuracy;
    if (s.peakAccuracy > poseStatsMap[s.poseId].peak) {
      poseStatsMap[s.poseId].peak = s.peakAccuracy;
    }
  });

  const poseBreakdownList = Object.entries(poseStatsMap)
    .map(([poseId, data]) => ({
      poseId,
      name: data.name,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
      peak: data.peak,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Form Analytics & Biomechanics
            </span>
            <span className="text-xs text-slate-400">On-Device Processing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Progress & Accuracy Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Track kinematic improvements, duration records, and pose consistency over time based on actual webcam landmark coordinates.
          </p>
        </div>

        <button
          onClick={exportSessionsAsCSV}
          disabled={sessions.length === 0}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs border border-slate-700/80 transition-colors flex items-center gap-2 self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>Export History as CSV</span>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Average Pose Accuracy</span>
          <p className="font-mono text-3xl font-black text-white">{averageAccuracy}%</p>
          <p className="text-[11px] text-emerald-400 font-medium">Kinematic alignment grade</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Personal Peak Accuracy</span>
          <p className="font-mono text-3xl font-black text-cyan-400">{peakAccuracy}%</p>
          <p className="text-[11px] text-slate-400">Best single-session score</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Cumulative Practice Time</span>
          <p className="font-mono text-3xl font-black text-violet-400">{totalMinutes} min</p>
          <p className="text-[11px] text-slate-400">{totalSessions} sessions logged</p>
        </div>
        <div className="glass-panel p-5 rounded-2xl space-y-1.5 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Estimated Active Cal</span>
          <p className="font-mono text-3xl font-black text-amber-400">{totalCalories} kcal</p>
          <p className="text-[11px] text-slate-400">ACSM MET-based estimate</p>
        </div>
      </div>

      {/* Accuracy Trend Chart (Custom Responsive SVG Visualizer) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span>Pose Accuracy Trend Over Time</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated against individual joint criteria (0% to 100%)
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Actual Measurement Sessions</span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="w-full h-56 relative pt-4">
          {sessions.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
              No session data logged yet. Complete a practice session to view trends.
            </div>
          ) : (
            <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="gradientAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="600" y2="130" stroke="#1e293b" strokeDasharray="3 3" />

              {/* 85% qualification threshold line */}
              <line x1="0" y1="42" x2="600" y2="42" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <text x="510" y="38" fill="#10b981" fontSize="9" fontFamily="JetBrains Mono">
                85% Target Level
              </text>

              {/* Data points path */}
              {(() => {
                const recent = sessions.slice(0, 10).reverse();
                if (recent.length < 2) {
                  return null;
                }

                const stepX = 560 / (recent.length - 1);
                const points = recent.map((s, i) => {
                  const x = 20 + i * stepX;
                  // Map score 50..100 to y 150..20
                  const y = 160 - ((Math.max(50, s.averageAccuracy) - 50) / 50) * 130;
                  return { x, y, score: s.averageAccuracy, name: s.poseName };
                });

                const d = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                const areaD = `${d} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#gradientAccuracy)" />
                    <path d={d} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#0c1220" stroke="#06b6d4" strokeWidth="2.5" />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="JetBrains Mono"
                          fontWeight="bold"
                        >
                          {p.score}%
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          )}
        </div>
      </div>

      {/* Breakdown by Pose Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Biomechanical Accuracy by Posture</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="pb-3 pl-2">Pose</th>
                <th className="pb-3">Completed Sessions</th>
                <th className="pb-3">Average Accuracy</th>
                <th className="pb-3">Personal Best</th>
                <th className="pb-3 pr-2">Alignment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {poseBreakdownList.map((p) => (
                <tr key={p.poseId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white">{p.name}</td>
                  <td className="py-3.5 text-slate-300 font-mono">{p.count} times</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-100">{p.avgScore}%</span>
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.avgScore >= 85 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${p.avgScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-mono text-cyan-400 font-bold">{p.peak}%</td>
                  <td className="py-3.5 pr-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.avgScore >= 85
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {p.avgScore >= 85 ? 'Proficient' : 'In Progress'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
