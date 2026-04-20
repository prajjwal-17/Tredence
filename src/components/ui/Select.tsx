import { memo, type SelectHTMLAttributes, useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = memo<SelectProps>(function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  ...props
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
        >
          {label}
          {props.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`
          w-full px-3 py-2 text-sm
          bg-slate-800/80 border border-slate-600/50 rounded-lg
          text-slate-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500/50 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
