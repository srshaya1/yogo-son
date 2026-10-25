/**
 * YogaFlow AI - Real-Time AI Training Workspace (Centerpiece)
 * Live MediaPipe Pose Detection, Skeletal Canvas Overlays, Biomechanical Angle Tracking & Feedback
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { YOGA_POSES, getPoseById } from '../data/poses';
import { PoseScoringEngine } from '../vision/scoringEngine';
import { mediaPipeService } from '../vision/mediaPipeService';
import { renderPoseOverlay, RenderOptions } from '../vision/canvasRenderer';
import { calculateEstimatedCalories } from '../utils/calorieCalculator';
import { PoseIllustration } from './PoseIllustration';
import { LivePoseAnalysis } from '../types';
import confetti from 'canvas-confetti';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  Flame,
  Gauge,
  HelpCircle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  StopCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TrainingWorkspaceProps {
  initialPoseId?: string;
  onFinishSession?: (sessionId: string) => void;
  isAssessmentMode?: boolean;
  onAssessmentPoseComplete?: (poseId: string, score: number, duration: number) => void;
}

export const TrainingWorkspace: React.FC<TrainingWorkspaceProps> = ({
  initialPoseId,
  onFinishSession,
  isAssessmentMode = false,
  onAssessmentPoseComplete,
}) => {
  const { selectedPoseId, setSelectedPoseId, currentUser, addSession } = useApp();

  // Active pose
  const activePoseId = initialPoseId || selectedPoseId;
  const currentPose = getPoseById(activePoseId) || YOGA_POSES[0];

  // Video & Canvas DOM references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Vision & scoring engines
  const scoringEngineRef = useRef<PoseScoringEngine>(new PoseScoringEngine());
  const requestAnimationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Session state
  const [sessionState, setSessionState] = useState<'idle' | 'initializing' | 'active' | 'paused' | 'completed'>('idle');
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<'unloaded' | 'loading' | 'ready' | 'error'>('unloaded');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Historical accuracy during this session for averaging
  const scoresHistoryRef = useRef<number[]>([]);
  const peakScoreRef = useRef<number>(0);

  // Live analysis state
  const [liveAnalysis, setLiveAnalysis] = useState<LivePoseAnalysis>({
    isTracking: false,
    trackingConfidence: 0,
    isSufficientConfidence: false,
    overallScore: 0,
    categoryScores: { jointAngles: 0, majorAlignment: 0, poseSpecific: 0, symmetryStability: 0 },
    jointMeasurements: {},
    feedbackMessages: ['Position your camera so your full body is visible.'],
    primaryError: null,
    torsoInclination: 0,
    symmetryRatio: 1,
    validLandmarksCount: 0,
  });

  // Render options toggles
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    showSkeleton: true,
    showMarkers: true,
    showAngles: true,
    showConfidence: true,
    isMirrored: true,
    cleanMode: false,
  });

  // Collapsible panels
  const [analysisPanelOpen, setAnalysisPanelOpen] = useState<boolean>(true);
  const [referencePanelOpen, setReferencePanelOpen] = useState<boolean>(true);

  // Active session completed modal state
  const [completedSummary, setCompletedSummary] = useState<{
    poseName: string;
    duration: number;
    avgScore: number;
    peakScore: number;
    calories: number;
  } | null>(null);

  // Camera initialization
  const startCamera = async () => {
    setCameraError(null);
    setSessionState('initializing');
    setModelStatus('loading');

    try {
      // 1. Initialize MediaPipe
      await mediaPipeService.initialize();
      setModelStatus('ready');

      // 2. Request webcam with ideal resolution
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setSessionState('active');
        scoresHistoryRef.current = [];
        peakScoreRef.current = 0;
      }
    } catch (err: unknown) {
      console.error('Camera/MediaPipe error:', err);
      let errorMsg = 'Failed to access camera feed.';
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        errorMsg = 'Camera permission denied. Please allow camera access in your browser to enable live pose tracking.';
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        errorMsg = 'No camera device detected on your system. Please connect a webcam.';
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      setSessionState('idle');
      setModelStatus('error');
    }
  };

  // Stop camera tracks and loops
  const stopCamera = useCallback(() => {
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Session timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sessionState === 'active') {
      interval = setInterval(() => {
        setSessionDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionState]);

  // Real-time Computer Vision Frame Processing Loop
  useEffect(() => {
    if (sessionState !== 'active') return;

    let isSubscribed = true;

    const processFrame = (now: DOMHighResTimeStamp) => {
      if (!isSubscribed) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= 2 && !video.paused) {
        // Sync canvas resolution with actual video stream size
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        // Run MediaPipe Landmark detection
        const landmarks = mediaPipeService.detectVideoFrame(video, now);

        // Run Pose Biomechanical Evaluation
        const analysis = scoringEngineRef.current.evaluate(currentPose, landmarks);

        setLiveAnalysis(analysis);

        // Record scores if tracking confidence is valid
        if (analysis.isSufficientConfidence && analysis.overallScore > 0) {
          scoresHistoryRef.current.push(analysis.overallScore);
          if (analysis.overallScore > peakScoreRef.current) {
            peakScoreRef.current = analysis.overallScore;
          }
        }

        // Render skeleton and angle badges onto HTML5 canvas overlay
        renderPoseOverlay(
          canvas,
          video,
          landmarks,
          analysis.jointMeasurements,
          renderOptions,
          analysis.overallScore
        );
      }

      requestAnimationRef.current = requestAnimationFrame(processFrame);
    };

    requestAnimationRef.current = requestAnimationFrame(processFrame);

    return () => {
      isSubscribed = false;
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
        requestAnimationRef.current = null;
      }
    };
  }, [sessionState, currentPose, renderOptions]);

  // Finish Practice Session
  const handleFinishSession = () => {
    stopCamera();
    setSessionState('completed');

    const duration = sessionDurationSeconds;
    const scores = scoresHistoryRef.current;
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : (liveAnalysis.overallScore || 0);

    const peak = Math.max(peakScoreRef.current, avgScore);
    const calorieCalc = calculateEstimatedCalories(duration, currentPose.metValue, currentUser.weightKg);

    // Save session in context
    const saved = addSession({
      userId: currentUser.id,
      poseId: currentPose.id,
      poseName: currentPose.name,
      sanskritName: currentPose.sanskritName,
      date: new Date().toISOString(),
      durationSeconds: duration,
      averageAccuracy: avgScore,
      peakAccuracy: peak,
      caloriesBurned: calorieCalc.totalCalories,
      isAssessment: isAssessmentMode,
      feedbackSummary: liveAnalysis.feedbackMessages.slice(0, 3),
    });

    setCompletedSummary({
      poseName: currentPose.name,
      duration,
      avgScore,
      peakScore: peak,
      calories: calorieCalc.totalCalories,
    });

    // Assessment callback
    if (isAssessmentMode && onAssessmentPoseComplete) {
      onAssessmentPoseComplete(currentPose.id, avgScore, duration);
    }

    // Celebration confetti on great form!
    if (avgScore >= 85) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981'],
        });
      } catch (e) {
        // ignore
      }
    }

    if (onFinishSession) {
      onFinishSession(saved.id);
    }
  };

  // Restart session
  const handleRestart = () => {
    setSessionDurationSeconds(0);
    scoresHistoryRef.current = [];
    peakScoreRef.current = 0;
    scoringEngineRef.current.reset();
    if (sessionState === 'paused' && videoRef.current) {
      videoRef.current.play();
      setSessionState('active');
    }
  };

  // Pause / Resume toggle
  const togglePause = () => {
    if (sessionState === 'active') {
      if (videoRef.current) videoRef.current.pause();
      setSessionState('paused');
    } else if (sessionState === 'paused') {
      if (videoRef.current) videoRef.current.play();
      setSessionState('active');
    }
  };

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const caloriesNow = calculateEstimatedCalories(
    sessionDurationSeconds,
    currentPose.metValue,
    currentUser.weightKg
  );

  return (
    <div className="w-full flex-1 flex flex-col bg-[#070b14] overflow-hidden">
      {/* Top Session Control Bar */}
      <div className="border-b border-slate-800/80 bg-[#0b1020]/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Pose Selector & Sanskrit name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
              Active Pose
            </span>
            <div className="relative">
              <select
                value={currentPose.id}
                onChange={(e) => {
                  setSelectedPoseId(e.target.value);
                  scoringEngineRef.current.reset();
                }}
                disabled={sessionState === 'active' || isAssessmentMode}
                className="bg-slate-900 border border-slate-700 text-slate-100 font-bold rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400 disabled:opacity-60 cursor-pointer text-sm"
              >
                {YOGA_POSES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sanskritName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <span className="hidden sm:inline-block text-slate-400 italic text-xs">
            {currentPose.sanskritName} • {currentPose.difficulty}
          </span>
        </div>

        {/* Live Timer, Calorie Tracker & Session HUD */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 rounded-lg border border-slate-800 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">
              {formatTime(sessionDurationSeconds)}
            </span>
            <span className="text-slate-500 text-[10px]">
              / {formatTime(currentPose.recommendedHoldSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 rounded-lg border border-slate-800 font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-slate-100 text-sm">
              {caloriesNow.totalCalories}
            </span>
            <span className="text-slate-500 text-[10px]">kcal est.</span>
          </div>

          {/* Model Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                modelStatus === 'ready'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                  : modelStatus === 'loading'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-400">
              {modelStatus === 'ready'
                ? 'MediaPipe Vision Active'
                : modelStatus === 'loading'
                ? 'Loading Neural Assets...'
                : 'Computer Vision Idle'}
            </span>
          </div>
        </div>

        {/* View Layout Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAnalysisPanelOpen(!analysisPanelOpen)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              analysisPanelOpen
                ? 'bg-violet-950/40 border-violet-600/40 text-violet-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Analysis Panel"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Analysis</span>
          </button>

          <button
            onClick={() => setReferencePanelOpen(!referencePanelOpen)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              referencePanelOpen
                ? 'bg-violet-950/40 border-violet-600/40 text-violet-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Reference Guide"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Guide</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body - 3 Columns */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT PANEL: Real-Time Biomechanical Analysis */}
        {analysisPanelOpen && (
          <aside className="w-full lg:w-80 xl:w-88 border-r border-slate-800/80 bg-[#090e1c] flex flex-col overflow-y-auto p-4 gap-4 z-10 shrink-0">
            {/* Overall Score Dial */}
            <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Live Form Accuracy
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    liveAnalysis.isSufficientConfidence
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {liveAnalysis.isSufficientConfidence ? 'Tracking High Confidence' : 'Awaiting Full Body'}
                </span>
              </div>

              {/* Dynamic Score Ring */}
              <div className="flex items-center gap-4 py-2">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      className="text-slate-800"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      strokeWidth="6"
                      strokeDasharray={213}
                      strokeDashoffset={213 - (213 * (liveAnalysis.overallScore || 0)) / 100}
                      strokeLinecap="round"
                      stroke={
                        liveAnalysis.overallScore >= 85
                          ? '#10b981'
                          : liveAnalysis.overallScore >= 65
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                      fill="transparent"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black font-mono tracking-tight text-white">
                      {liveAnalysis.overallScore}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 -mt-1">/ 100</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Joint Angles (40%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {liveAnalysis.categoryScores.jointAngles}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${liveAnalysis.categoryScores.jointAngles}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Torso Alignment (25%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {liveAnalysis.categoryScores.majorAlignment}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${liveAnalysis.categoryScores.majorAlignment}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Kinetic Balance (15%)</span>
                    <span className="font-mono font-bold text-slate-200">
                      {liveAnalysis.categoryScores.symmetryStability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${liveAnalysis.categoryScores.symmetryStability}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-800/80 pt-2 leading-relaxed">
                Biomechanical evaluation calculated from actual MediaPipe vector dot-products. Minimum instructor qualification threshold is{' '}
                <strong className="text-amber-300">85%</strong>.
              </p>
            </div>

            {/* Real-time Corrective Feedback Card */}
            <div className="glass-panel p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>AI Form Coaching Feedback</span>
              </div>

              {liveAnalysis.feedbackMessages.map((msg, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs text-slate-200 leading-relaxed"
                >
                  {liveAnalysis.overallScore >= 85 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span>{msg}</span>
                </div>
              ))}
            </div>

            {/* Individual Joint Angle Breakdown */}
            <div className="glass-panel p-4 rounded-2xl flex-1 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Target Angle Criteria ({currentPose.angleCriteria.length} Joints)
                </span>
                <span className="text-[10px] text-slate-400">Live vs Target</span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1">
                {currentPose.angleCriteria.map((crit) => {
                  const measurement = liveAnalysis.jointMeasurements[crit.jointKey];
                  const currentAngle = measurement?.currentAngle ? Math.round(measurement.currentAngle) : 0;
                  const status = measurement?.status || 'insufficient_confidence';

                  return (
                    <div
                      key={crit.jointKey}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{crit.name}</span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`font-bold ${
                              status === 'optimal'
                                ? 'text-emerald-400'
                                : status === 'moderate'
                                ? 'text-amber-400'
                                : status === 'deviated'
                                ? 'text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {status === 'insufficient_confidence' ? '--' : `${currentAngle}°`}
                          </span>
                          <span className="text-slate-500 text-[10px]">/ {crit.targetAngle}° (±{crit.tolerance}°)</span>
                        </div>
                      </div>

                      {/* Angular gauge bar */}
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all duration-200 ${
                            status === 'optimal'
                              ? 'bg-emerald-400'
                              : status === 'moderate'
                              ? 'bg-amber-400'
                              : status === 'deviated'
                              ? 'bg-rose-500'
                              : 'bg-slate-700'
                          }`}
                          style={{
                            width: status === 'insufficient_confidence' ? '0%' : `${Math.min(100, (currentAngle / 180) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* CENTER: Main Live Camera & Skeleton Overlay Area */}
        <main className="flex-1 flex flex-col bg-[#050811] relative overflow-hidden items-center justify-center p-3 sm:p-6">
          {/* Main Camera Frame Card */}
          <div className="relative w-full max-w-4xl h-[420px] sm:h-[520px] md:h-[580px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* HTML5 Video element (feed) */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-contain ${renderOptions.isMirrored ? 'scale-x-[-1]' : ''}`}
            />

            {/* HTML5 Canvas overlay (skeleton & biomechanical angles) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Idle / Permission / Camera Launcher Overlay */}
            {sessionState === 'idle' && (
              <div className="absolute inset-0 bg-[#070b16]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 mb-4 shadow-xl shadow-violet-500/20">
                  <div className="w-full h-full bg-[#090e1c] rounded-[14px] flex items-center justify-center">
                    <Camera className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                  Launch Live AI Pose Tracking
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
                  YogaFlow AI uses browser-based MediaPipe computer vision to track your body joints in real-time. No video is ever recorded or uploaded to external servers.
                </p>

                {cameraError && (
                  <div className="mb-6 p-3 max-w-md rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={startCamera}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Enable Camera & Begin</span>
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-6 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Local In-Browser Vision
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Real Geometric Angles
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Zero Remote Video Leaks
                  </span>
                </div>
              </div>
            )}

            {/* Initializing / Loading Assets Overlay */}
            {sessionState === 'initializing' && (
              <div className="absolute inset-0 bg-[#070b16]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-12 h-12 border-3 border-violet-500/30 border-t-cyan-400 rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-bold text-white mb-1">Activating Computer Vision Engine...</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Loading MediaPipe Pose Landmarker neural graph and initializing webcam stream.
                </p>
              </div>
            )}

            {/* Paused state watermark overlay */}
            {sessionState === 'paused' && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-20">
                <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2">
                  <Pause className="w-4 h-4 text-amber-400 fill-current" />
                  <span>Session Paused</span>
                </div>
              </div>
            )}

            {/* Live Camera HUD Overlays (when active) */}
            {sessionState === 'active' && (
              <>
                {/* Top Floating Badge: Pose & Confidence */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>{currentPose.name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {Math.round(liveAnalysis.trackingConfidence * 100)}% conf
                    </span>
                  </div>

                  {!liveAnalysis.isSufficientConfidence && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-950/85 backdrop-blur-md border border-amber-600/80 text-xs font-semibold text-amber-200 flex items-center gap-1.5 shadow-lg animate-bounce">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Step back into view</span>
                    </div>
                  )}
                </div>

                {/* Top Right Floating Controls Pill */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
                  <button
                    onClick={() => setRenderOptions((prev) => ({ ...prev, isMirrored: !prev.isMirrored }))}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      renderOptions.isMirrored ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400'
                    }`}
                    title="Mirror webcam preview"
                  >
                    Flip
                  </button>
                  <button
                    onClick={() => setRenderOptions((prev) => ({ ...prev, showSkeleton: !prev.showSkeleton }))}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      renderOptions.showSkeleton ? 'bg-violet-950 text-violet-300 border border-violet-800' : 'text-slate-400'
                    }`}
                    title="Toggle skeleton lines"
                  >
                    Skeleton
                  </button>
                  <button
                    onClick={() => setRenderOptions((prev) => ({ ...prev, showAngles: !prev.showAngles }))}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      renderOptions.showAngles ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400'
                    }`}
                    title="Toggle angle badges"
                  >
                    Angles
                  </button>
                  <button
                    onClick={() => setRenderOptions((prev) => ({ ...prev, cleanMode: !prev.cleanMode }))}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      renderOptions.cleanMode ? 'bg-slate-800 text-white' : 'text-slate-400'
                    }`}
                    title="Clean preview without graphics"
                  >
                    Clean
                  </button>
                </div>

                {/* Bottom Center Floating Controls (Pause, Restart, Finish) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
                  <button
                    onClick={togglePause}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title={sessionState === 'active' ? 'Pause practice' : 'Resume practice'}
                  >
                    {sessionState === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    title="Restart timer and score history"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleFinishSession}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Complete Session</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </main>

        {/* RIGHT PANEL: Reference Pose Guide, Alignment Criteria & Breathing */}
        {referencePanelOpen && (
          <aside className="w-full lg:w-80 xl:w-88 border-l border-slate-800/80 bg-[#090e1c] flex flex-col overflow-y-auto p-4 gap-4 z-10 shrink-0">
            {/* Pose Reference Silhouette & Illustration */}
            <div className="glass-panel p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Target Reference Pose</span>
                <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                  Biomechanical Standard
                </span>
              </div>

              {/* Vector diagram card */}
              <div className="w-full h-44 rounded-xl bg-gradient-to-b from-slate-900 to-[#0c1220] border border-slate-800 flex items-center justify-center p-3">
                <PoseIllustration svgType={currentPose.svgType} className="w-full h-full" />
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-white text-sm">{currentPose.name}</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {currentPose.targetCharacteristic}
                </p>
              </div>
            </div>

            {/* Step-by-Step Kinematic Guidance */}
            <div className="glass-panel p-4 rounded-2xl space-y-2.5">
              <span className="text-xs font-semibold text-slate-300">Execution Instructions</span>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
                {currentPose.stepByStepInstructions.map((step, idx) => (
                  <li key={idx} className="leading-relaxed pl-1 text-slate-300">
                    <span className="text-slate-200">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Common Mistakes to Avoid */}
            <div className="glass-panel p-4 rounded-2xl space-y-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Common Form Mistakes
              </span>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {currentPose.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                    <span className="text-amber-500">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Muscle Groups & MET */}
            <div className="glass-panel p-4 rounded-2xl space-y-2 text-xs">
              <span className="font-semibold text-slate-300">Biomechanical Demands</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentPose.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                Activity Intensity: {currentPose.metValue} METs (~{Math.round(currentPose.metValue * 1.1 * 10) / 10} cal/min)
              </p>
            </div>
          </aside>
        )}
      </div>

      {/* Completed Session Summary Modal */}
      {completedSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <h3 className="text-xl font-black text-white">Session Completed!</h3>
              <p className="text-xs text-slate-400">
                {completedSummary.poseName} • Practice session saved to your profile
              </p>
            </div>

            {/* Score & Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-2xl font-black text-white">{completedSummary.avgScore}%</p>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Avg Accuracy</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-2xl font-black text-cyan-400">{formatTime(completedSummary.duration)}</p>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Duration</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-2xl font-black text-amber-400">{completedSummary.calories}</p>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">Calories (kcal)</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-slate-200 mb-1">Peak Form Accuracy: {completedSummary.peakScore}%</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {completedSummary.avgScore >= 85
                  ? 'Outstanding biomechanical precision! Your joint angles and vertical plumbline alignment met master qualification criteria.'
                  : 'Great practice effort! Review the joint angle feedback to fine-tune your limb extension on your next session.'}
              </p>
            </div>

            <button
              onClick={() => {
                setCompletedSummary(null);
                setSessionState('idle');
                setSessionDurationSeconds(0);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-violet-600/30 hover:brightness-110 transition-all"
            >
              Close & Return to Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
