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
  const { user, activeView, showOnboarding, showAuthModal, setShowAuthModal } = useApp();

  // If user is not authenticated or explicitly on auth view, render AuthView
  if (!user || activeView === 'auth') {
    return (
      <div className="min-h-[100dvh] w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased transition-colors flex flex-col justify-center">
        <AuthView />
      </div>
    );
  }

  const isDedicatedChat = activeView === 'chat';

  return (
    <div className="min-h-[100dvh] max-w-lg mx-auto w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased transition-colors flex flex-col relative shadow-2xl overflow-x-hidden">

      {/* Persistent Liquid Glass Header */}
      {!isDedicatedChat && <Header />}

      {/* Main Dynamic View Content Layer */}
      <main className={`flex-1 w-full ${isDedicatedChat ? 'pb-0 pt-0 flex flex-col min-h-0 h-[100dvh]' : 'pb-28 pt-1'}`}>
        {activeView === 'home' && <HomeView />}
        {activeView === 'chat' && <ConversationView />}
        {activeView === 'learn' && <ProgressView />}
        {activeView === 'explore' && <ScenariosView />}
        {activeView === 'profile' && <ProfileSettingsView />}
        {activeView === 'vocab' && <VocabularyView />}
        {activeView === 'grammar' && <GrammarView />}
      </main>

      {/* Persistent Liquid Glass Bottom Navigation (Always Visible) */}
      <BottomNav />

      {/* Authentication Modal / Overlay if prompted */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md">
          <AuthView onComplete={() => setShowAuthModal(false)} />
        </div>
      )}

      {/* Onboarding Flow Modal for newly registered users */}
      {showOnboarding && <OnboardingModal />}

    </div>
  );
}
