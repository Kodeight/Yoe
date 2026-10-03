import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  id?: string;
}

/**
 * Universal Mobile-First Toggle / Switch Component
 * Built with standard flex layout to guarantee the circular white thumb
 * remains 100% visible and positioned correctly in both LTR and RTL (Arabic) modes.
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  id
}) => {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors duration-200 ease-in-out p-1 flex items-center shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/40 disabled:opacity-50 select-none ${
        checked
          ? 'bg-emerald-500 justify-end'
          : 'bg-slate-300 dark:bg-slate-700 justify-start'
      }`}
    >
      <span
        className="w-5 h-5 rounded-full bg-white shadow-md block transition-transform duration-200 pointer-events-none"
      />
    </button>
  );
};
