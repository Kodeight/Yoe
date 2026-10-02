import React, { useState, useEffect } from 'react';
import { Bell, Clock, ShieldCheck, Send, CheckCircle2, AlertTriangle, Sparkles, Volume2 } from 'lucide-react';
import {
  getNotificationConfig,
  saveNotificationConfig,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  getMsUntilTime,
  isNotificationSupported,
  NotificationScheduleConfig
} from '../utils/notificationScheduler';

export const PushNotificationScheduler: React.FC = () => {
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
    setIsSending(true);
    setTestError('');
    setTestSent(false);

    try {
      const currentPerm = getNotificationPermission();
      if (currentPerm !== 'granted') {
        const req = await requestNotificationPermission();
        setPermission(req);
        if (req !== 'granted') {
          setTestError('Notification permission was not granted by your browser.');
          setIsSending(false);
          return;
        }
      }

      const success = await sendTestNotification();
      if (success) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      } else {
        setTestError('Could not send notification. Check your browser notification settings.');
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
      return `in ${mins} minutes`;
    }
    return `in ${hours} hr ${mins} min`;
  };

  const presets = [
    { label: 'Morning', time: '09:00' },
    { label: 'Afternoon', time: '14:00' },
    { label: 'Evening', time: '18:30' },
    { label: 'Night', time: '21:00' }
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
              <span>Daily Reminder Push Scheduler</span>
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Personalized speaking habit reminders at your preferred time
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={config.enabled}
          onClick={handleToggle}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 focus:outline-none ${
            config.enabled ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
              config.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
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

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          permission === 'granted'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : permission === 'denied'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {permission === 'granted' ? 'Allowed' : permission === 'denied' ? 'Blocked' : 'Default'}
        </span>
      </div>

      {/* Configurable Reminder Time */}
      <div className="space-y-1.5 pt-0.5">
        <label className="text-[11px] font-bold text-[var(--text-primary)] block">
          Select Notification Time (24h)
        </label>

        <div className="flex items-center gap-2.5">
          <input
            type="time"
            value={config.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={!config.enabled}
            className="bg-slate-950/40 dark:bg-slate-950/40 light-mode:bg-white border border-[var(--border)] rounded-2xl px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-emerald-400 disabled:opacity-40"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {presets.map((p) => (
              <button
                key={p.time}
                type="button"
                disabled={!config.enabled}
                onClick={() => handleTimeChange(p.time)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  config.time === p.time
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-800/60 dark:bg-slate-800/60 light-mode:bg-slate-100 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Test Notification and Permission request action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 dark:border-white/5 light-mode:border-slate-200">
        <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local & Service Worker push reminders (no spam).</span>
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
            <Send className="w-3 h-3" />
          )}
          <span>Send Test Push</span>
        </button>
      </div>

      {/* Test feedback alerts */}
      {testSent && (
        <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Test notification sent! Check your system notification tray.</span>
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
