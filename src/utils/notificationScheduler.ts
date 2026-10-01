export interface NotificationScheduleConfig {
  enabled: boolean;
  time: string; // Format: "HH:mm" (24h)
  soundEnabled: boolean;
  targetLanguageName?: string;
}

const SETTINGS_KEY = 'yoe_push_notification_config';
let activeTimerId: any = null;

export const DEFAULT_CONFIG: NotificationScheduleConfig = {
  enabled: true,
  time: '20:00', // 8:00 PM default reminder
  soundEnabled: true,
  targetLanguageName: 'Target Language'
};

export function getNotificationConfig(): NotificationScheduleConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveNotificationConfig(config: Partial<NotificationScheduleConfig>): NotificationScheduleConfig {
  const current = getNotificationConfig();
  const updated = { ...current, ...config };
  if (typeof window !== 'undefined') {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }
  setupDailyReminderTimer(updated);
  return updated;
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const config = getNotificationConfig();
      setupDailyReminderTimer(config);
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'default';
  }
}

/**
 * Calculates ms until the next occurrence of "HH:mm"
 */
export function getMsUntilTime(timeStr: string): number {
  const [hoursStr, minutesStr] = timeStr.split(':');
  const targetHour = parseInt(hoursStr, 10) || 20;
  const targetMin = parseInt(minutesStr, 10) || 0;

  const now = new Date();
  const scheduledDate = new Date(now);
  scheduledDate.setHours(targetHour, targetMin, 0, 0);

  // If time already passed today, schedule for tomorrow
  if (scheduledDate.getTime() <= now.getTime()) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  return scheduledDate.getTime() - now.getTime();
}

/**
 * Dispatches a notification using either the Service Worker or Web Notification API
 */
export async function sendNotification(
  title: string,
  options: { body: string; icon?: string; badge?: string; tag?: string }
): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  const defaultIcon = '/icon-192.png';
  const defaultBadge = '/favicon.png';

  try {
    // Try via Service Worker first for maximum mobile & background compatibility
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body: options.body,
          icon: options.icon || defaultIcon,
          badge: options.badge || defaultBadge,
          tag: options.tag || 'yoe-daily-reminder',
          renotify: true,
          vibrate: [150, 80, 150]
        } as any);
        return true;
      }
    }

    // Fallback to standard window Notification
    new Notification(title, {
      body: options.body,
      icon: options.icon || defaultIcon,
      badge: options.badge || defaultBadge,
      tag: options.tag || 'yoe-daily-reminder'
    });
    return true;
  } catch (err) {
    console.warn('Notification dispatch fallback error:', err);
    return false;
  }
}

/**
 * Schedules the recurring daily alarm in JavaScript runtime
 */
export function setupDailyReminderTimer(config?: NotificationScheduleConfig) {
  if (typeof window === 'undefined') return;
  if (activeTimerId) {
    clearTimeout(activeTimerId);
    activeTimerId = null;
  }

  const cfg = config || getNotificationConfig();
  if (!cfg.enabled || Notification.permission !== 'granted') {
    return;
  }

  const ms = getMsUntilTime(cfg.time);
  console.log(`[Yoe Notification] Next daily reminder scheduled in ${Math.round(ms / 60000)} minutes at ${cfg.time}`);

  activeTimerId = setTimeout(async () => {
    await sendNotification('Yoe - Daily Conversation Reminder! 🔥', {
      body: `Keep your learning streak alive! Open Yoe for your 5-minute speaking practice today.`,
      tag: 'daily-streak-reminder'
    });
    // Schedule for the next day
    setupDailyReminderTimer(cfg);
  }, ms);
}

/**
 * Sends a real test notification immediately
 */
export async function sendTestNotification(): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') {
    return false;
  }

  return await sendNotification('Yoe - Notification System Active! 🔔', {
    body: 'Daily speaking reminders are configured and working. Keep your daily streak going!',
    tag: 'yoe-test-ping'
  });
}
