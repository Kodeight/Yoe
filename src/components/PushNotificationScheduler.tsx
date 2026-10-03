import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTranslation } from '../utils/i18n';
import { Bell, Clock, ShieldCheck, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Toggle } from './Toggle';
import {
  getNotificationConfig,
  saveNotificationConfig,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  getMsUntilTime,
  NotificationScheduleConfig
} from '../utils/notificationScheduler';

export const PushNotificationScheduler: React.FC = () => {
  const { uiLanguage } = useApp();
  const t = getTranslation(uiLanguage);

  const [config, setConfig] = useState<NotificationScheduleConfig>(() => getNotificationConfig());
  const [permission, setPermission] = useState<string>('default');
  const [testSent, setTestSent] = useState(false);
  const [testError, setTestError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleToggle = async () => {
    const nextEnabled = !config.enabled;
    if (nextEnabled && permission !== 'granted') {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== 'granted') {
        return;
      }
    }
    const updated = saveNotificationConfig({ enabled: nextEnabled });
    setConfig(updated);
  };

  const handleTimeChange = (newTime: string) => {
    const updated = saveNotificationConfig({ time: newTime });
    setConfig(updated);
  };

  const handleTestNotification = async () => {
    if (isSending) return;
    setIsSending(true);
    setTestError('');
    setTestSent(false);

    try {
      let currentPerm = getNotificationPermission();
      if (currentPerm !== 'granted') {
        const req = await requestNotificationPermission();
        setPermission(req);
        if (req !== 'granted') {
          setTestError(req === 'denied' ? 'Notification permission was denied in your browser settings.' : 'Notification permission not granted.');
          setIsSending(false);
          return;
        }
      }

      // Small pause to allow browser permission state to settle
      await new Promise(r => setTimeout(r, 100));

      const success = await sendTestNotification();
      if (success) {
        setTestSent(true);
        setTestError('');
        setTimeout(() => setTestSent(false), 4500);
      } else {
        setTestError('Could not send notification. Please check browser permissions.');
      }
    } catch (err: any) {
      setTestError(err.message || 'Failed to dispatch test notification.');
    } finally {
      setIsSending(false);
    }
  };

  const formatRemainingTime = (timeStr: string): string => {
    const ms = getMsUntilTime(timeStr);
    const totalMinutes = Math.round(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) {
      return `in ${mins}m`;
    }
    return `in ${hours}h ${mins}m`;
  };

  const presets = [
    { label: '09:00', time: '09:00' },
    { label: '14:00', time: '14:00' },
    { label: '18:30', time: '18:30' },
    { label: '21:00', time: '21:00' }
  ];

  return (
    <div className="rounded-3xl glass-card p-4.5 shadow-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span>{t.dailyReminders}</span>
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Personalized speaking habit reminders at your preferred time
            </p>
          </div>
        </div>

        {/* Master Toggle with Guaranteed Circular Thumb in LTR & RTL */}
        <Toggle
          checked={config.enabled}
          onChange={handleToggle}
          aria-label={t.dailyReminders}
        />
      </div>

      {/* Permission Status Pill */}
      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-2xl glass-pill">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next Reminder:</span>
          {config.enabled ? (
            <span className="font-bold text-emerald-400">
              {config.time} ({formatRemainingTime(config.time)})
            </span>
          ) : (
            <span className="text-[var(--text-muted)] font-medium">Paused</span>
          )}
        </div>

        {permission !== 'granted' && (
          <span className="text-[10px] text-amber-400 font-bold">
            Permission required
          </span>
        )}
      </div>

      {/* Preset Time Selector Pills */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
          <span>Reminder Time</span>
          <input
            type="time"
            value={config.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-transparent text-emerald-400 font-mono font-bold text-xs focus:outline-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {presets.map((p) => (
            <button
              key={p.time}
              type="button"
              onClick={() => handleTimeChange(p.time)}
              className={`py-1.5 px-2 rounded-xl text-xs font-semibold cursor-pointer transition-all text-center ${
                config.time === p.time
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'glass-pill text-[var(--text-secondary)] hover:border-emerald-500/30'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Notification Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 dark:border-white/5 light-mode:border-slate-200">
        <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local & Service Worker push reminders.</span>
        </p>

        <button
          type="button"
          onClick={handleTestNotification}
          disabled={isSending}
          className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1.5 border border-emerald-500/25 cursor-pointer transition-all disabled:opacity-50"
        >
          {isSending ? (
            <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3 h-3 rtl-mirror" />
          )}
          <span>{isSending ? t.testPushSending : t.sendTestPush}</span>
        </button>
      </div>

      {/* Test Feedback Alerts */}
      {testSent && (
        <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{t.testPushSent}</span>
        </div>
      )}

      {testError && (
        <div className="p-2.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{testError}</span>
        </div>
      )}
    </div>
  );
};
