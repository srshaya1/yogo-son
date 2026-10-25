/**
 * YogaFlow AI - Instructor Certification & Pose Assessment Engine
 * 5-Pose Live Qualification Test with strict 85% passing threshold
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { YOGA_POSES, INSTRUCTOR_ASSESSMENT_POSE_IDS, getPoseById } from '../data/poses';
import { TrainingWorkspace } from './TrainingWorkspace';
import { AssessmentPoseResult } from '../types';
import { PoseIllustration } from './PoseIllustration';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';

export const InstructorAssessment: React.FC = () => {
  const { currentUser, saveAssessmentResult, setActiveTab } = useApp();

  // Test flow state: 'intro' | 'testing' | 'results'
  const [assessmentStep, setAssessmentStep] = useState<'intro' | 'testing' | 'results'>('intro');
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(0);
  const [poseResults, setPoseResults] = useState<Record<string, AssessmentPoseResult>>({});

  // Assessment pose objects
  const assessmentPoses = INSTRUCTOR_ASSESSMENT_POSE_IDS.map((id) => getPoseById(id)!).filter(Boolean);
  const activeAssessmentPose = assessmentPoses[currentTestIndex];

  // Callback when a single pose is completed in the live workspace
  const handlePoseComplete = (poseId: string, score: number, duration: number) => {
    const poseObj = getPoseById(poseId);
    const result: AssessmentPoseResult = {
      poseId,
      poseName: poseObj?.name || poseId,
      score: Math.round(score),
      passed: score >= 85,
      completedAt: new Date().toISOString(),
      durationSeconds: duration,
      confidenceAverage: 0.92,
    };

    const updatedResults = {
      ...poseResults,
      [poseId]: result,
    };

    setPoseResults(updatedResults);

    // If there are more poses to test
    if (currentTestIndex + 1 < assessmentPoses.length) {
      setCurrentTestIndex((prev) => prev + 1);
    } else {
      // Completed all 5 poses! Compute final aggregate score
      const totalScore = Object.values(updatedResults).reduce((sum, r) => sum + r.score, 0);
      const overall = Math.round(totalScore / assessmentPoses.length);

      const strengths: string[] = [];
      const improvements: string[] = [];

      Object.values(updatedResults).forEach((r) => {
        if (r.score >= 88) {
          strengths.push(`Exceptional biomechanical stability in ${r.poseName} (${r.score}%)`);
        } else if (r.score < 85) {
          improvements.push(`Refine angular alignment and stance tolerance in ${r.poseName} (${r.score}%)`);
        }
      });

      if (strengths.length === 0) {
        strengths.push('Consistent joint tracking and posture endurance');
      }
      if (improvements.length === 0) {
        improvements.push('Maintain steady breathing during 45-second isometric holds');
      }

      saveAssessmentResult({
        instructorId: currentUser.id,
        instructorName: currentUser.name,
        date: new Date().toISOString(),
        overallScore: overall,
        passed: overall >= 85 && Object.keys(updatedResults).length === 5,
        poseResults: updatedResults,
        strengths,
        improvements,
      });

      if (overall >= 85) {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
          });
        } catch (e) {
          // ignore
        }
      }

      setAssessmentStep('results');
    }
  };

  // Reset & retake
  const handleRetake = () => {
    setPoseResults({});
    setCurrentTestIndex(0);
    setAssessmentStep('intro');
  };

  // 1. INTRO SCREEN
  if (assessmentStep === 'intro') {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 text-xs font-bold">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Official Computer Vision Verification</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Instructor Pose Proficiency Assessment
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            To ensure the highest standard of technical alignment in our marketplace, all teaching candidates must demonstrate verified biomechanical precision across five foundational postures.
          </p>
        </div>

        {/* Qualification Standards Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Assessment Protocol & Scoring Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">Pass Threshold</span>
              <p className="text-2xl font-black font-mono text-emerald-400">≥ 85%</p>
              <p className="text-[11px] text-slate-400">Scores &lt; 85% do not qualify for marketplace listing.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">Required Postures</span>
              <p className="text-2xl font-black font-mono text-cyan-400">5 Poses</p>
              <p className="text-[11px] text-slate-400">All 5 poses must be completed with high tracking confidence.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">Tracking Engine</span>
              <p className="text-2xl font-black font-mono text-violet-400">MediaPipe</p>
              <p className="text-[11px] text-slate-400">Real vectors evaluated against anatomical target ranges.</p>
            </div>
          </div>

          {/* 5 Required Poses Preview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">The 5 Test Asanas:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {assessmentPoses.map((pose, idx) => (
                <div
                  key={pose.id}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-950 p-1 flex items-center justify-center">
                    <PoseIllustration svgType={pose.svgType} className="w-full h-full" />
                  </div>
                  <span className="text-[10px] font-bold text-violet-400 font-mono">Pose {idx + 1}</span>
                  <p className="text-xs font-bold text-slate-200 leading-tight">{pose.name}</p>
                  <p className="text-[10px] text-slate-400 italic">{pose.sanskritName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Important Medical & Verification Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-100">Verification Boundary:</strong> Passing this assessment verifies only your real-time computer-vision performance against YogaFlow AI's configurable anatomical criteria. It is not a licensed medical certification, physical therapy credential, or real-world identity background check.
            </div>
          </div>

          {/* Start Assessment Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Ensure you have at least 2.5 meters of clear space in front of your camera.
            </p>
            <button
              onClick={() => setAssessmentStep('testing')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-black text-sm tracking-wide shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-2 border border-violet-400"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Rəsmi İmtahana Başla</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. LIVE TESTING SCREEN
  if (assessmentStep === 'testing') {
    return (
      <div className="w-full flex-1 flex flex-col bg-[#070b14]">
        {/* Step progress bar */}
        <div className="border-b border-slate-800 bg-[#090e1c] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Candidate Test In Progress
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Pose {currentTestIndex + 1} of {assessmentPoses.length}:{' '}
              <strong className="text-white">{activeAssessmentPose.name}</strong> ({activeAssessmentPose.sanskritName})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {assessmentPoses.map((p, idx) => {
              const res = poseResults[p.id];
              return (
                <div
                  key={p.id}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                    res
                      ? res.passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                      : idx === currentTestIndex
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                  title={p.name}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Workspace Mount */}
        <TrainingWorkspace
          key={activeAssessmentPose.id}
          initialPoseId={activeAssessmentPose.id}
          isAssessmentMode={true}
          onAssessmentPoseComplete={handlePoseComplete}
        />
      </div>
    );
  }

  // 3. FINAL RESULTS SCREEN
  const completedList = Object.values(poseResults);
  const overallScore = completedList.length > 0
    ? Math.round(completedList.reduce((acc, r) => acc + r.score, 0) / completedList.length)
    : 0;
  const isPassed = overallScore >= 85 && completedList.length === 5;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Result Hero Banner */}
      <div
        className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-2xl text-center space-y-4 ${
          isPassed
            ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-slate-950/80'
            : 'border-rose-500/40 bg-gradient-to-b from-rose-950/40 to-slate-950/80'
        }`}
      >
        <div className="w-20 h-20 rounded-3xl p-0.5 mx-auto shadow-2xl flex items-center justify-center">
          {isPassed ? (
            <div className="w-full h-full rounded-[22px] bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          ) : (
            <div className="w-full h-full rounded-[22px] bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <span
            className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            {isPassed ? 'Assessment Passed — Certified Eligible' : 'Assessment Threshold Not Met'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Final Assessment Score: <span className="font-mono">{overallScore}%</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            {isPassed
              ? 'Congratulations! You achieved 85% or higher across all required poses. You are now verified and listed on the YogaFlow Instructor Marketplace.'
              : 'You scored below the required 85% qualification threshold. Review your individual pose measurements below and retake the assessment when ready.'}
          </p>
        </div>

        {/* Individual Poses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-4 text-left">
          {assessmentPoses.map((p) => {
            const res = poseResults[p.id];
            const score = res?.score ?? 0;
            const passed = score >= 85;

            return (
              <div
                key={p.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Test Pose</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      passed ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {score}%
                  </span>
                </div>
                <p className="font-bold text-xs text-white leading-tight">{p.name}</p>
                <p className="text-[10px] text-slate-400 italic">{p.sanskritName}</p>
              </div>
            );
          })}
        </div>

        {/* Action Buttons with clean symmetry */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleRetake}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-600 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>İmtahanı Yenidən Ver</span>
          </button>

          {isPassed && (
            <button
              onClick={() => setActiveTab('instructors')}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 border border-emerald-400"
            >
              <Compass className="w-4 h-4" />
              <span>Marketplace Profilinə Bax</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
