import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LearningJourney, Scenario, VocabularyItem, MistakeRecord, LanguageCode, Language } from '../types';

interface AppContextType {
  user: User | null;
  journeys: LearningJourney[];
  activeJourney: LearningJourney | null;
  activeScenario: Scenario | null;
  scenarios: Scenario[];
  vocabulary: VocabularyItem[];
  mistakes: MistakeRecord[];
  activeView: 'home' | 'chat' | 'learn' | 'explore' | 'profile' | 'vocab' | 'grammar' | 'auth';
  theme: 'dark' | 'light';
  uiLanguage: LanguageCode;
  isRtl: boolean;
  isOnline: boolean;
  isBooting: boolean;
  showOnboarding: boolean;
  showAuthModal: boolean;
  pwaInstallPrompt: any;
  setActiveView: (view: 'home' | 'chat' | 'learn' | 'explore' | 'profile' | 'vocab' | 'grammar' | 'auth') => void;
  setActiveJourney: (journey: LearningJourney) => void;
  setActiveScenarioId: (scenarioId: string) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  setUiLanguage: (lang: LanguageCode) => void;
  createNewJourney: (targetLang: LanguageCode, supportLang: LanguageCode, level?: string) => Promise<void>;
  updateActiveJourney: (updates: Partial<LearningJourney>) => Promise<void>;
  refreshProgress: () => Promise<void>;
  cacheLearnedLessonsForOffline: () => void;
  dismissOnboarding: () => void;
  setShowAuthModal: (show: boolean) => void;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  installPWA: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [journeys, setJourneys] = useState<LearningJourney[]>([]);
  const [activeJourney, setActiveJourneyState] = useState<LearningJourney | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [activeView, setActiveView] = useState<'home' | 'chat' | 'learn' | 'explore' | 'profile' | 'vocab' | 'grammar' | 'auth'>('auth');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yoe_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark';
  });
  const [uiLanguage, setUiLanguageState] = useState<LanguageCode>('en');
  const [isRtl, setIsRtl] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any>(null);

  // Monitor connectivity state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Catch PWA install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const getAuthHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('yoe_auth_token') : null;
    return token ? { Authorization: token } : {};
  };

  // Fetch initial scenarios and authenticate
  useEffect(() => {
    async function loadInitialData() {
      try {
        // First load public scenarios for curriculum foundation
        const scenRes = await fetch('/api/scenarios');
        const scenData = await scenRes.json();
        if (scenData.scenarios) {
          setScenarios(scenData.scenarios);
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('yoe_auth_token') : null;
        if (!token) {
          setUser(null);
          setActiveView('auth');
          return;
        }

        const userRes = await fetch('/api/auth/me', {
          headers: getAuthHeader()
        });
        const userData = await userRes.json();
        if (userData.user) {
          setUser(userData.user);
          const savedTheme = localStorage.getItem('yoe_theme') as 'dark' | 'light';
          setTheme(savedTheme || userData.user.theme || 'dark');
          setUiLanguageState(userData.user.uiLanguage || 'en');

          const journeysRes = await fetch('/api/journeys', {
            headers: getAuthHeader()
          });
          const journeysData = await journeysRes.json();
          const loadedJourneys: LearningJourney[] = journeysData.journeys || [];

          if (loadedJourneys.length > 0) {
            setJourneys(loadedJourneys);
            const activeMatch = (userData.user.activeJourneyId && loadedJourneys.find((j: LearningJourney) => j.id === userData.user.activeJourneyId)) || loadedJourneys[0];
            setActiveJourneyState(activeMatch);
            await loadScenariosAndData(activeMatch);
            setShowOnboarding(false);
            setActiveView('home');
          } else if (userData.user.onboardingCompleted) {
            setShowOnboarding(false);
            setActiveView('home');
          } else {
            setShowOnboarding(true);
            setActiveView('home');
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('yoe_auth_token');
          setUser(null);
          setActiveView('auth');
        }
      } catch (err) {
        console.warn('Network offline or error loading initial data, trying offline fallback:', err);
        if (typeof window !== 'undefined') {
          const offlineVocab = localStorage.getItem('yoe_cached_vocabulary');
          const offlineMstk = localStorage.getItem('yoe_cached_mistakes');
          const offlineScen = localStorage.getItem('yoe_cached_scenarios');
          if (offlineVocab) setVocabulary(JSON.parse(offlineVocab));
          if (offlineMstk) setMistakes(JSON.parse(offlineMstk));
          if (offlineScen) {
            const sc = JSON.parse(offlineScen);
            setScenarios(sc);
            if (sc.length > 0) setActiveScenario(sc[0]);
          }
        }
      } finally {
        setIsBooting(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    // Apply theme & RTL direction to document root
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
      document.documentElement.style.colorScheme = 'dark';
    }

    if (uiLanguage === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      setIsRtl(true);
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      setIsRtl(false);
    }
  }, [theme, uiLanguage]);

  const cacheLearnedLessonsForOffline = () => {
    if (!activeJourney) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoe_cached_vocabulary', JSON.stringify(vocabulary));
      localStorage.setItem('yoe_cached_mistakes', JSON.stringify(mistakes));
      localStorage.setItem('yoe_cached_scenarios', JSON.stringify(scenarios));
    }

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_LEARNED_LESSONS',
        payload: {
          vocabularyUrl: `/api/vocabulary?journeyId=${activeJourney.id}`,
          vocabulary,
          mistakesUrl: `/api/mistakes?journeyId=${activeJourney.id}`,
          mistakes,
          scenariosUrl: `/api/scenarios?targetLanguage=${activeJourney.targetLanguage}`,
          scenarios
        }
      });
    }
  };

  const loadScenariosAndData = async (journey: LearningJourney) => {
    try {
      const scenRes = await fetch(`/api/scenarios?targetLanguage=${journey.targetLanguage}`);
      const scenData = await scenRes.json();
      const loadedScenarios = scenData.scenarios || [];
      setScenarios(loadedScenarios);

      if (loadedScenarios.length > 0) {
        const match = loadedScenarios.find((s: Scenario) => s.id === journey.activeScenarioId) || loadedScenarios[0];
        setActiveScenario(match);
      }

      const vocabRes = await fetch(`/api/vocabulary?journeyId=${journey.id}`);
      const vocabData = await vocabRes.json();
      const loadedVocab = vocabData.vocabulary || [];
      setVocabulary(loadedVocab);

      const mstkRes = await fetch(`/api/mistakes?journeyId=${journey.id}`);
      const mstkData = await mstkRes.json();
      const loadedMistakes = mstkData.mistakes || [];
      setMistakes(loadedMistakes);

      // Save to localStorage for instant offline access
      if (typeof window !== 'undefined') {
        localStorage.setItem('yoe_cached_vocabulary', JSON.stringify(loadedVocab));
        localStorage.setItem('yoe_cached_mistakes', JSON.stringify(loadedMistakes));
        localStorage.setItem('yoe_cached_scenarios', JSON.stringify(loadedScenarios));
      }

      // Send to service worker listener to cache for offline review
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_LEARNED_LESSONS',
          payload: {
            vocabularyUrl: `/api/vocabulary?journeyId=${journey.id}`,
            vocabulary: loadedVocab,
            mistakesUrl: `/api/mistakes?journeyId=${journey.id}`,
            mistakes: loadedMistakes,
            scenariosUrl: `/api/scenarios?targetLanguage=${journey.targetLanguage}`,
            scenarios: loadedScenarios
          }
        });
      }
    } catch (err) {
      console.warn('Network offline or error loading journey details. Recovering from offline cache:', err);
      if (typeof window !== 'undefined') {
        const offlineVocab = localStorage.getItem('yoe_cached_vocabulary');
        const offlineMstk = localStorage.getItem('yoe_cached_mistakes');
        const offlineScen = localStorage.getItem('yoe_cached_scenarios');
        if (offlineVocab) setVocabulary(JSON.parse(offlineVocab));
        if (offlineMstk) setMistakes(JSON.parse(offlineMstk));
        if (offlineScen) {
          const sc = JSON.parse(offlineScen);
          setScenarios(sc);
          if (sc.length > 0) setActiveScenario(sc[0]);
        }
      }
    }
  };

  const setActiveJourney = (journey: LearningJourney) => {
    setActiveJourneyState(journey);
    loadScenariosAndData(journey);
    if (user) {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ activeJourneyId: journey.id })
      }).catch(() => {});
    }
  };

  const updateActiveJourney = async (updates: Partial<LearningJourney>) => {
    if (!activeJourney) return;
    try {
      const updated = { ...activeJourney, ...updates };
      setActiveJourneyState(updated);
      setJourneys(prev => prev.map(j => j.id === activeJourney.id ? updated : j));

      const res = await fetch(`/api/journeys/${activeJourney.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.journey) {
        setActiveJourneyState(data.journey);
        setJourneys(prev => prev.map(j => j.id === data.journey.id ? data.journey : j));
      }
    } catch (err) {
      console.error('Failed to update active journey:', err);
    }
  };

  const setActiveScenarioId = (scenarioId: string) => {
    const found = scenarios.find(s => s.id === scenarioId);
    if (found) {
      setActiveScenario(found);
      if (activeJourney) {
        const updated = { ...activeJourney, activeScenarioId: scenarioId };
        setActiveJourneyState(updated);
        fetch(`/api/journeys/${activeJourney.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activeScenarioId: scenarioId })
        }).catch(() => {});
      }
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoe_theme', nextTheme);
    }
    if (user) {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme })
      }).catch(() => {});
    }
  };

  const setThemeMode = (mode: 'dark' | 'light') => {
    setTheme(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoe_theme', mode);
    }
    if (user) {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: mode })
      }).catch(() => {});
    }
  };

  const setUiLanguage = (lang: LanguageCode) => {
    setUiLanguageState(lang);
    if (user) {
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uiLanguage: lang })
      }).catch(() => {});
    }
  };

  const createNewJourney = async (targetLang: LanguageCode, supportLang: LanguageCode, level: string = 'A1') => {
    if (!user) return;
    try {
      const res = await fetch('/api/journeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          userId: user.id,
          targetLanguage: targetLang,
          supportLanguage: supportLang,
          cefrLevel: level
        })
      });
      const data = await res.json();
      if (data.journey) {
        setJourneys(prev => [data.journey, ...prev]);
        setActiveJourney(data.journey);
      }
    } catch (err) {
      console.error('Failed to create new journey:', err);
    }
  };

  const refreshProgress = async () => {
    if (!activeJourney) return;
    try {
      const res = await fetch(`/api/journeys/${activeJourney.id}`);
      const data = await res.json();
      if (data.journey) {
        setActiveJourneyState(data.journey);
      }
      const vocabRes = await fetch(`/api/vocabulary?journeyId=${activeJourney.id}`);
      const vocabData = await vocabRes.json();
      setVocabulary(vocabData.vocabulary || []);

      const mstkRes = await fetch(`/api/mistakes?journeyId=${activeJourney.id}`);
      const mstkData = await mstkRes.json();
      setMistakes(mstkData.mistakes || []);
    } catch (err) {
      console.error('Error refreshing progress:', err);
    }
  };

  const dismissOnboarding = () => setShowOnboarding(false);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        return false;
      }
      if (data.token) {
        localStorage.setItem('yoe_auth_token', data.token);
      }
      setUser(data.user);
      if (data.journeys && data.journeys.length > 0) {
        setJourneys(data.journeys);
        setActiveJourney(data.journeys[0]);
      } else {
        setShowOnboarding(true);
      }
      setShowAuthModal(false);
      setActiveView('home');
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          email,
          password
        })
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        return { success: false, error: data.error || 'Failed to create account' };
      }
      if (data.token) {
        localStorage.setItem('yoe_auth_token', data.token);
      }
      setUser(data.user);
      setJourneys([]);
      setActiveJourneyState(null);
      setShowAuthModal(false);
      setShowOnboarding(true); // Enters conversational onboarding immediately
      setActiveView('home');
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('yoe_auth_token');
    localStorage.removeItem('yoe_cached_vocabulary');
    localStorage.removeItem('yoe_cached_mistakes');
    setUser(null);
    setJourneys([]);
    setActiveJourneyState(null);
    setVocabulary([]);
    setMistakes([]);
    setActiveView('auth');
  };

  const installPWA = () => {
    if (pwaInstallPrompt) {
      pwaInstallPrompt.prompt();
      pwaInstallPrompt.userChoice.then(() => setPwaInstallPrompt(null));
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        journeys,
        activeJourney,
        activeScenario,
        scenarios,
        vocabulary,
        mistakes,
        activeView,
        theme,
        uiLanguage,
        isRtl,
        isOnline,
        isBooting,
        showOnboarding,
        showAuthModal,
        pwaInstallPrompt,
        setActiveView,
        setActiveJourney,
        setActiveScenarioId,
        toggleTheme,
        setThemeMode,
        setUiLanguage,
        createNewJourney,
        updateActiveJourney,
        refreshProgress,
        cacheLearnedLessonsForOffline,
        dismissOnboarding,
        setShowAuthModal,
        login,
        register,
        logout,
        installPWA
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
