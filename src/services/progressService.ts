import { LearningJourney, Scenario } from '../types';

export interface ScenarioCompletionPayload {
  scenarioId: string;
  journeyId?: string;
  userId?: string;
  durationSeconds?: number;
  durationMinutes?: number;
  errorCount?: number;
  xpEarned?: number;
}

export interface ScenarioCompletionResult {
  success: boolean;
  journey?: LearningJourney;
  nextRecommended?: Scenario[];
  sessionRecord?: {
    id: string;
    scenarioId: string;
    durationSeconds: number;
    durationMinutes: number;
    errorCount: number;
    xpEarned: number;
    completedAt: string;
  };
  error?: string;
}

/**
 * Service layer function to persist scenario completion status,
 * including duration and error count, to the database via API,
 * and ensure the UI progress state is synchronized.
 */
export async function persistScenarioCompletion(
  payload: ScenarioCompletionPayload
): Promise<ScenarioCompletionResult> {
  const {
    scenarioId,
    journeyId,
    userId = 'guest_user',
    durationSeconds,
    durationMinutes,
    errorCount = 0,
    xpEarned = 50
  } = payload;

  const token = typeof window !== 'undefined' ? localStorage.getItem('yoe_auth_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Calculate duration in minutes if only seconds provided or vice versa
  const calculatedDurationMins =
    durationMinutes || (durationSeconds ? Math.max(1, Math.round(durationSeconds / 60)) : 3);
  const calculatedDurationSecs = durationSeconds || calculatedDurationMins * 60;

  try {
    const response = await fetch('/api/progress/complete-scenario', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        journeyId,
        scenarioId,
        durationSeconds: calculatedDurationSecs,
        durationMinutes: calculatedDurationMins,
        errorCount,
        xpEarned
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed with status ${response.status}`);
    }

    const data = await response.json();

    // Cache updated journey for instant UI responsiveness
    if (data.journey && typeof window !== 'undefined') {
      localStorage.setItem('yoe_active_journey', JSON.stringify(data.journey));
    }

    // Save scenario ID in local completed list
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yoe_completed_scenarios');
        const list: string[] = saved ? JSON.parse(saved) : [];
        if (!list.includes(scenarioId)) {
          list.push(scenarioId);
          localStorage.setItem('yoe_completed_scenarios', JSON.stringify(list));
        }
      } catch (e) {}
    }

    return {
      success: true,
      journey: data.journey,
      nextRecommended: data.nextRecommended,
      sessionRecord: data.sessionRecord
    };
  } catch (error: any) {
    console.warn('[progressService] API sync note:', error.message || error);

    // Graceful offline fallback: update local storage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yoe_completed_scenarios');
        const list: string[] = saved ? JSON.parse(saved) : [];
        if (!list.includes(scenarioId)) {
          list.push(scenarioId);
          localStorage.setItem('yoe_completed_scenarios', JSON.stringify(list));
        }
      } catch (e) {}
    }

    return {
      success: true,
      error: error.message || 'Offline saved'
    };
  }
}
