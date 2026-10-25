/**
 * YogaFlow AI - Camera Setup & Positioning Guide Modal
 * Guides users on framing, lighting, space requirements, and device privacy
 */

import React from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Lightbulb,
  Maximize2,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react';

interface CameraPositioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchPractice: () => void;
}

export const CameraPositioningModal: React.FC<CameraPositioningModalProps> = ({
  isOpen,
  onClose,
  onLaunchPractice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-7 space-y-6 animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Video className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Camera Positioning & Form Guide</h2>
            <p className="text-xs text-slate-400">Optimize for 98%+ MediaPipe landmark detection</p>
          </div>
        </div>

        {/* 4 Essential Guidelines */}
        <div className="space-y-3 text-xs">
          {/* 1. Distance */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 font-bold font-mono">
              1
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Step Back 2 to 3 Meters (6–10 ft)</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                Ensure your full body—from head to both feet—remains visible in the frame simultaneously, including during standing arm reaches.
              </p>
            </div>
          </div>

          {/* 2. Camera Elevation */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 font-bold font-mono">
              2
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Set Camera at Waist / Hip Height</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                Placing your laptop or phone on a table or chair minimizes perspective distortion for vertical plumbline angles.
              </p>
            </div>
          </div>

          {/* 3. Frontal Lighting */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono">
              3
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Illuminate from Front (Avoid Backlight)</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
                Position light sources facing you. Do not stand directly in front of bright windows which turn your body into a dark silhouette.
              </p>
            </div>
          </div>

          {/* 4. Privacy Guarantee */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 text-emerald-200">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-100">100% On-Device Visual Privacy</h4>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed mt-0.5">
                Video frames are processed in real-time inside your browser's WebAssembly sandbox. Raw images and webcam streams are never transmitted or stored remotely.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onClose();
            onLaunchPractice();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-black text-sm tracking-wide shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-2 border border-violet-400"
        >
          <Camera className="w-5 h-5 text-white" />
          <span>AI Məşqini Başlat</span>
        </button>
      </div>
    </div>
  );
};
