/**
 * YogaFlow AI - High-Fidelity SVG Pose Silhouettes & Vector Diagrams
 * Renders clear, self-contained SVG biomechanical figures for all poses
 */

import React from 'react';

interface PoseIllustrationProps {
  svgType: string;
  className?: string;
  accentColor?: string;
  showKineticVectors?: boolean;
}

export const PoseIllustration: React.FC<PoseIllustrationProps> = ({
  svgType,
  className = 'w-full h-full',
  accentColor = '#8b5cf6',
  showKineticVectors = true,
}) => {
  // Render distinct biomechanical posture figures
  switch (svgType) {
    case 'mountain':
      return (
        <svg viewBox="0 0 200 240" className={className} fill="none" stroke="currentColor">
          {/* Floor line */}
          <line x1="40" y1="220" x2="160" y2="220" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Head */}
          <circle cx="100" cy="40" r="14" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Plumb line vector */}
          {showKineticVectors && (
            <line x1="100" y1="20" x2="100" y2="220" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          )}
          {/* Torso & Spine */}
          <line x1="100" y1="54" x2="100" y2="125" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Shoulders */}
          <line x1="75" y1="65" x2="125" y2="65" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          {/* Arms hanging by sides with palms forward */}
          <line x1="75" y1="65" x2="68" y2="105" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="68" y1="105" x2="64" y2="140" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <line x1="125" y1="65" x2="132" y2="105" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="132" y1="105" x2="136" y2="140" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          {/* Pelvis */}
          <line x1="82" y1="125" x2="118" y2="125" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Left Leg */}
          <line x1="88" y1="125" x2="88" y2="175" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="88" y1="175" x2="88" y2="220" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          {/* Right Leg */}
          <line x1="112" y1="125" x2="112" y2="175" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="112" y1="175" x2="112" y2="220" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          {/* Joints */}
          <circle cx="88" cy="175" r="4" fill="#10b981" />
          <circle cx="112" cy="175" r="4" fill="#10b981" />
          <circle cx="100" cy="125" r="4.5" fill="#8b5cf6" />
        </svg>
      );

    case 'tree':
      return (
        <svg viewBox="0 0 200 240" className={className} fill="none" stroke="currentColor">
          <line x1="40" y1="220" x2="160" y2="220" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="100" cy="38" r="14" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Upright Torso */}
          <line x1="100" y1="52" x2="100" y2="120" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Prayer hands (Anjali Mudra) */}
          <path d="M 80 62 L 100 80 L 120 62" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="80" r="4" fill="#8b5cf6" />
          {/* Standing Leg */}
          <line x1="98" y1="120" x2="98" y2="170" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="98" y1="170" x2="98" y2="220" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          {/* Bent Leg abducted */}
          <line x1="102" y1="120" x2="145" y2="150" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="145" y1="150" x2="102" y2="160" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          {/* Kinetic Arc */}
          <path d="M 120 120 A 30 30 0 0 1 138 145" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="145" cy="150" r="4.5" fill="#10b981" />
          <circle cx="98" cy="170" r="4" fill="#06b6d4" />
        </svg>
      );

    case 'warrior2':
      return (
        <svg viewBox="0 0 240 220" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="200" x2="220" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="110" cy="45" r="14" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Torso centered */}
          <line x1="110" y1="59" x2="110" y2="120" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Arms parallel horizontally */}
          <line x1="30" y1="70" x2="190" y2="70" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="30" y1="60" x2="190" y2="60" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          {/* Front Leg (Left, bent 90°) */}
          <line x1="110" y1="120" x2="60" y2="125" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="60" y1="125" x2="60" y2="200" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          {/* Back Leg (Right, straight 175°) */}
          <line x1="110" y1="120" x2="185" y2="200" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          {/* 90 degree marker at front knee */}
          <rect x="60" y="125" width="12" height="12" fill="none" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="60" cy="125" r="4.5" fill="#10b981" />
          <circle cx="150" cy="162" r="4" fill="#06b6d4" />
        </svg>
      );

    case 'warrior1':
      return (
        <svg viewBox="0 0 240 220" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="200" x2="220" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="105" cy="55" r="13" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Arms overhead */}
          <line x1="90" y1="15" x2="105" y2="65" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="120" y1="15" x2="105" y2="65" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          {/* Torso */}
          <line x1="105" y1="65" x2="105" y2="125" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Front bent knee */}
          <line x1="105" y1="125" x2="65" y2="135" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="65" y1="135" x2="65" y2="200" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          {/* Back extended leg */}
          <line x1="105" y1="125" x2="180" y2="200" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <circle cx="65" cy="135" r="4.5" fill="#10b981" />
        </svg>
      );

    case 'triangle':
      return (
        <svg viewBox="0 0 240 220" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="200" x2="220" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Stance legs forming triangle base */}
          <line x1="60" y1="200" x2="120" y2="120" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <line x1="120" y1="120" x2="180" y2="200" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          {/* Lateral Torso hinged sideways */}
          <line x1="120" y1="120" x2="75" y2="150" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="68" cy="155" r="12" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Stacked vertical arms */}
          <line x1="68" y1="198" x2="80" y2="60" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="75" y1="20" x2="75" y2="200" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <circle cx="60" cy="200" r="4" fill="#10b981" />
          <circle cx="80" cy="60" r="4" fill="#06b6d4" />
        </svg>
      );

    case 'downdog':
      return (
        <svg viewBox="0 0 240 200" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="180" x2="220" y2="180" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Inverted V apex at hips */}
          {/* Spine & Arms from wrists to hips */}
          <line x1="50" y1="180" x2="120" y2="65" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="70" cy="150" r="12" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Legs from hips to ankles */}
          <line x1="120" y1="65" x2="190" y2="180" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          {/* Apex angle arc */}
          <circle cx="120" cy="65" r="5" fill="#10b981" />
          <path d="M 105 85 A 25 25 0 0 1 135 85" stroke="#06b6d4" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="85" cy="122" r="4" fill="#8b5cf6" />
          <circle cx="155" cy="122" r="4" fill="#10b981" />
        </svg>
      );

    case 'plank':
      return (
        <svg viewBox="0 0 240 180" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="150" x2="220" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Arms vertical */}
          <line x1="60" y1="150" x2="60" y2="90" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <circle cx="48" cy="85" r="11" fill="#1e293b" stroke={accentColor} strokeWidth="2.5" />
          {/* Rigid diagonal bodyline */}
          <line x1="60" y1="90" x2="200" y2="148" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          <line x1="60" y1="90" x2="200" y2="148" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.7" />
          <circle cx="60" cy="90" r="4.5" fill="#06b6d4" />
          <circle cx="130" cy="119" r="4.5" fill="#10b981" />
          <circle cx="200" cy="148" r="4" fill="#8b5cf6" />
        </svg>
      );

    case 'chair':
      return (
        <svg viewBox="0 0 200 240" className={className} fill="none" stroke="currentColor">
          <line x1="30" y1="210" x2="170" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="95" cy="40" r="13" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Arms swept overhead */}
          <line x1="125" y1="15" x2="95" y2="55" stroke="#e2e8f0" strokeWidth="4.5" strokeLinecap="round" />
          {/* Torso angled forward */}
          <line x1="95" y1="55" x2="65" y2="125" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
          {/* Thighs parallel to ground */}
          <line x1="65" y1="125" x2="115" y2="135" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          {/* Shins to floor */}
          <line x1="115" y1="135" x2="105" y2="210" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          <circle cx="115" cy="135" r="4.5" fill="#10b981" />
          <circle cx="65" cy="125" r="4.5" fill="#06b6d4" />
        </svg>
      );

    case 'boat':
      return (
        <svg viewBox="0 0 220 200" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="170" x2="200" y2="170" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Sitting point */}
          <circle cx="100" cy="155" r="5" fill="#8b5cf6" />
          {/* Torso inclined back */}
          <line x1="100" y1="155" x2="55" y2="85" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="48" cy="72" r="12" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Legs elevated V-shape */}
          <line x1="100" y1="155" x2="165" y2="75" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
          {/* Arms extended horizontally */}
          <line x1="65" y1="105" x2="135" y2="105" stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
          <circle cx="165" cy="75" r="4.5" fill="#10b981" />
        </svg>
      );

    case 'cobra':
    default:
      return (
        <svg viewBox="0 0 240 180" className={className} fill="none" stroke="currentColor">
          <line x1="20" y1="150" x2="220" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Head & Arch */}
          <circle cx="70" cy="70" r="12" fill="#1e293b" stroke={accentColor} strokeWidth="3" />
          {/* Chest & Arching spine */}
          <path d="M 70 82 Q 95 105 130 145" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Legs extended on mat */}
          <line x1="130" y1="145" x2="215" y2="148" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
          {/* Hands pressing under shoulders */}
          <line x1="80" y1="100" x2="80" y2="148" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
          <circle cx="130" cy="145" r="4" fill="#06b6d4" />
          <circle cx="70" cy="82" r="4" fill="#10b981" />
        </svg>
      );
  }
};
