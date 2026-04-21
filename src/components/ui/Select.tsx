import { memo, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = memo<SelectProps>(function Select({
  label,
  options,
  className = '',
  id,
  ...props
}) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          h-11 w-full rounded-lg px-3.5 text-sm text-gray-900
          border border-gray-200 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
          transition-all duration-150 appearance-none
          ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});
