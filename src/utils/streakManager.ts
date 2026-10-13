export interface DayActivity {
  dayName: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  status: 'completed' | 'pending' | 'missed' | 'future';
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  totalActiveDays: number;
  weekDays: DayActivity[];
  streakStatusMessage: string;
}

const STORAGE_KEY = 'yoe_user_activity_dates';

export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getActivityDates(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function recordDayActivity(): StreakData {
  const today = getTodayDateStr();
  const dates = getActivityDates();
  if (!dates.includes(today)) {
    dates.push(today);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dates));
    }
  }
  return calculateStreak(dates);
}

function computeLongestConsecutiveRun(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sortedUnique = Array.from(new Set(dates)).sort();
  let maxRun = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedUnique.length; i++) {
    const prev = new Date(sortedUnique[i - 1]);
    const curr = new Date(sortedUnique[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > maxRun) maxRun = currentRun;
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  return maxRun;
}

export function calculateStreak(datesInput?: string[]): StreakData {
  const dates = datesInput || getActivityDates();
  const dateSet = new Set(dates);
  const todayStr = getTodayDateStr();
  const completedToday = dateSet.has(todayStr);

  const now = new Date();
  let streak = 0;
  let checkDate = new Date(now);

  if (completedToday) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (dateSet.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // If not completed today, check if yesterday was completed
    checkDate.setDate(checkDate.getDate() - 1);
    const yStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (dateSet.has(yStr)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (dateSet.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }
  }

  // Calculate past 7 days window (Monday to Sunday of current week, or last 7 days)
  const weekDays: DayActivity[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = offset === 0;
    const isCompleted = dateSet.has(dStr);

    let status: 'completed' | 'pending' | 'missed' | 'future' = 'missed';
    if (isCompleted) {
      status = 'completed';
    } else if (isToday) {
      status = 'pending';
    } else if (offset > 0) {
      status = 'missed';
    }

    weekDays.push({
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      dateStr: dStr,
      isToday,
      status
    });
  }

  const longestStreak = computeLongestConsecutiveRun(dates);
  const totalActiveDays = dateSet.size;

  let streakStatusMessage = '';
  if (completedToday) {
    streakStatusMessage = `You're on fire! 🔥 Practiced today. Next milestone: ${streak + 1} days!`;
  } else if (streak > 0) {
    streakStatusMessage = `Keep your ${streak}-day streak alive! Complete 1 scenario today.`;
  } else {
    streakStatusMessage = 'Start a new practice streak today!';
  }

  return {
    currentStreak: streak,
    longestStreak,
    completedToday,
    totalActiveDays,
    weekDays,
    streakStatusMessage
  };
}
