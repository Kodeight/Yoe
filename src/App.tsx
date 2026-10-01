import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';

import { HomeView } from './views/HomeView';
import { ConversationView } from './views/ConversationView';
import { ProgressView } from './views/ProgressView';
import { ScenariosView } from './views/ScenariosView';
import { ProfileSettingsView } from './views/ProfileSettingsView';
import { VocabularyView } from './views/VocabularyView';
import { GrammarView } from './views/GrammarView';
import { AuthView } from './views/AuthView';

export default function App() {
  const { activeView, showOnboarding, showAuthModal, setShowAuthModal } = useApp();

  const isChatView = activeView === 'chat';
  const isAuthView = activeView === 'auth';

  return (
    <div className="min-h-screen bg-[#0b0f17] dark:bg-[#0b0f17] light-mode:bg-slate-50 text-slate-100 dark:text-slate-100 light-mode:text-slate-900 font-sans transition-colors">

      {/* Persistent Header (Hidden in dedicated chat view and auth view) */}
      {!isChatView && !isAuthView && <Header />}

      {/* Main View Area */}
      <main className="w-full">
        {activeView === 'home' && <HomeView />}
        {activeView === 'chat' && <ConversationView />}
        {activeView === 'learn' && <ProgressView />}
        {activeView === 'explore' && <ScenariosView />}
        {activeView === 'profile' && <ProfileSettingsView />}
        {activeView === 'vocab' && <VocabularyView />}
        {activeView === 'grammar' && <GrammarView />}
        {activeView === 'auth' && <AuthView />}
      </main>

      {/* Bottom Sticky Navigation (Hidden in dedicated chat and auth view) */}
      {!isChatView && !isAuthView && <BottomNav />}

      {/* Authentication Modal / Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AuthView onComplete={() => setShowAuthModal(false)} />
        </div>
      )}

      {/* Onboarding Flow Modal */}
      {showOnboarding && <OnboardingModal />}

    </div>
  );
}
