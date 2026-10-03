/**
 * Haptic feedback utility leveraging navigator.vibrate API
 * Provides subtle physical feedback patterns for touch interactions across mobile devices & web browsers.
 */

export type HapticImpactType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

/**
 * Safely trigger vibration pattern if navigator.vibrate is supported by client device
 */
export function triggerHaptic(pattern: number | number[]): boolean {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      return navigator.vibrate(pattern);
    } catch (e) {
      // Ignore vibration permissions or hardware restrictions silently
      return false;
    }
  }
  return false;
}

/**
 * Subtle light tap feedback (6ms vibration)
 * Ideal for tab switches, key presses, and light navigation clicks
 */
export function hapticLight(): boolean {
  return triggerHaptic(6);
}

/**
 * Standard medium feedback (12ms vibration)
 * Ideal for main button clicks, toggle changes, or action confirmations
 */
export function hapticMedium(): boolean {
  return triggerHaptic(12);
}

/**
 * Heavy impact feedback (22ms vibration)
 * Ideal for critical actions like starting scenario or submitting answers
 */
export function hapticHeavy(): boolean {
  return triggerHaptic(22);
}

/**
 * Very subtle selection tick (4ms vibration)
 * Ideal for scrolling option selections, segmented controls, or bottom navbar item taps
 */
export function hapticSelection(): boolean {
  return triggerHaptic(4);
}

/**
 * Success notification haptic pattern (Short double pulse: 8ms, 30ms pause, 12ms)
 * Ideal for completed objectives, correct quiz choices, or streak milestones
 */
export function hapticSuccess(): boolean {
  return triggerHaptic([8, 30, 12]);
}

/**
 * Warning haptic pattern (Two distinct pulses: 15ms, 40ms pause, 15ms)
 * Ideal for hint reveals, alerts, or retry prompts
 */
export function hapticWarning(): boolean {
  return triggerHaptic([15, 40, 15]);
}

/**
 * Error notification haptic pattern (Triple buzz: 20ms, 40ms pause, 20ms, 40ms pause, 20ms)
 * Ideal for incorrect answers, network drop alerts, or error states
 */
export function hapticError(): boolean {
  return triggerHaptic([20, 40, 20, 40, 20]);
}

/**
 * Dispatch haptic feedback by impact category string
 */
export function hapticImpact(type: HapticImpactType = 'light'): boolean {
  switch (type) {
    case 'light':
      return hapticLight();
    case 'medium':
      return hapticMedium();
    case 'heavy':
      return hapticHeavy();
    case 'selection':
      return hapticSelection();
    case 'success':
      return hapticSuccess();
    case 'warning':
      return hapticWarning();
    case 'error':
      return hapticError();
    default:
      return hapticLight();
  }
}
