/**
 * YogaFlow AI - Main Application Entrypoint
 * Unites navigation, training workspace, student dashboard, instructor assessment, marketplace, and test suite
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TrainingWorkspace } from './components/TrainingWorkspace';
import { StudentDashboard } from './components/StudentDashboard';
import { YogaLibrary } from './components/YogaLibrary';
import { AnalyticsView } from './components/AnalyticsView';
import { InstructorMarketplace } from './components/InstructorMarketplace';
import { InstructorAssessment } from './components/InstructorAssessment';
import { BookingsView } from './components/BookingsView';
import { EducationalReferencesView } from './components/EducationalReferencesView';
import { SystemTestsView } from './components/SystemTestsView';
import { CameraPositioningModal } from './components/CameraPositioningModal';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* Top Navigation */}
      <Navbar onOpenPositioningGuide={() => setGuideModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'overview' && <StudentDashboard />}
        {activeTab === 'practice' && <TrainingWorkspace />}
        {activeTab === 'library' && <YogaLibrary />}
        {activeTab === 'progress' && <AnalyticsView />}
        {activeTab === 'instructors' && <InstructorMarketplace />}
        {activeTab === 'assessment' && <InstructorAssessment />}
        {activeTab === 'bookings' && <BookingsView />}
        {activeTab === 'references' && <EducationalReferencesView />}
        {activeTab === 'tests' && <SystemTestsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060911] py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">YogaFlow AI</span>
            <span>•</span>
            <span>MediaPipe PoseLandmarker Computer Vision</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>On-Device Processing</span>
            <span>•</span>
            <span>ACSM MET Calorie Modeling</span>
            <span>•</span>
            <span>100% Local Visual Privacy</span>
          </div>
        </div>
      </footer>

      {/* Camera Positioning Guide Modal */}
      <CameraPositioningModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onLaunchPractice={() => setActiveTab('practice')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
