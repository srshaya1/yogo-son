/**
 * YogaFlow AI - Interactive Private Lesson Video Room (Demo Classroom)
 * Simulated 2-way instructor-student virtual studio with real-time pose sync & form coaching
 */

import React, { useState } from 'react';
import { LessonBooking } from '../types';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Maximize2,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  Users,
  Video,
  VideoOff,
  Volume2,
} from 'lucide-react';

interface LessonRoomProps {
  booking: LessonBooking;
  onExit: () => void;
}

export const LessonRoom: React.FC<LessonRoomProps> = ({ booking, onExit }) => {
  const [micActive, setMicActive] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: booking.instructorName,
      text: `Hello ${booking.studentName}! Welcome to our private session. Please ensure your full mat is visible in your camera.`,
      time: '14:02',
    },
    {
      sender: 'System AI',
      text: 'Biomechanical tracking synchronized. Live joint angular feedback is active.',
      time: '14:02',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'You',
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060911] flex flex-col overflow-hidden text-slate-100">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-800 bg-[#090e1c] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h2 className="font-bold text-sm text-white">
              Private Lesson with {booking.instructorName}
            </h2>
            <p className="text-[11px] text-slate-400">
              {booking.date} • {booking.timeSlot} ({booking.durationMinutes} min)
            </p>
          </div>
        </div>

        {/* Video Service Disclaimer Banner */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Prototype Classroom: Simulated WebRTC room interface. Real video calling service to be connected in production.
          </span>
        </div>

        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Main Video Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 gap-4">
        {/* Left: Video Feeds (Instructor large + Student picture-in-picture) */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex-1 relative rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {/* Instructor Feed simulation */}
            <img
              src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1280"
              alt="Instructor Live Video Feed"
              className="w-full h-full object-cover opacity-85"
            />

            {/* Instructor Name Overlay */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{booking.instructorName} (Instructor)</span>
            </div>

            {/* Simulated Live Form Correction HUD */}
            <div className="absolute top-4 left-4 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/80 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Live AI Synchronized HUD
              </span>
              <p className="text-white font-bold">Warrior II Pose Analysis</p>
              <p className="text-emerald-400 text-[11px]">Front Knee Angle: 92° (Target: 95°)</p>
            </div>

            {/* Student Picture-in-Picture */}
            <div className="absolute top-4 right-4 w-48 sm:w-64 h-36 sm:h-44 rounded-2xl bg-slate-900 border-2 border-violet-500/50 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=640"
                alt="Student Feed"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-slate-950/80 text-[10px] font-semibold text-slate-200">
                You ({booking.studentName})
              </div>
            </div>

            {/* Center Bottom Call Toolbar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-2xl">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-3 rounded-xl transition-colors ${
                  micActive ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setCameraActive(!cameraActive)}
                className={`p-3 rounded-xl transition-colors ${
                  cameraActive ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-rose-600 text-white'
                }`}
                title={cameraActive ? 'Disable Camera' : 'Enable Camera'}
              >
                {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
              <button
                onClick={onExit}
                className="p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                title="End Video Lesson"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Chat & Whiteboard Notes */}
        <div className="w-full lg:w-80 xl:w-96 glass-panel rounded-3xl p-4 flex flex-col justify-between border border-slate-800 h-80 lg:h-auto">
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session In-Room Chat & Cues</span>
            </h3>

            {/* Chat message list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs space-y-1 ${
                    m.sender === 'You'
                      ? 'bg-violet-950/60 border border-violet-800/40 text-slate-200 ml-4'
                      : m.sender === 'System AI'
                      ? 'bg-cyan-950/40 border border-cyan-800/30 text-cyan-200'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800/80 flex gap-2">
            <input
              type="text"
              placeholder="Ask your instructor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
