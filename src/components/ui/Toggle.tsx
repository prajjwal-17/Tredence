import { memo, useId } from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle = memo<ToggleProps>(function Toggle({
  label,
  checked,
  onChange,
  disabled = false,
}) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-3">
      <label
        htmlFor={id}
        className="text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer"
      >
        {label}
      </label>
      <button
        id={id}
        role="switch"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 focus:outline-none focus:ring-2
          focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900
          disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
          ${checked ? 'bg-indigo-600' : 'bg-slate-600'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white
            transition-transform duration-200 shadow-sm
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
});
