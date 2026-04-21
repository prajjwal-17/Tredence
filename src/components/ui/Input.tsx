import { memo, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = memo<InputProps>(function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          h-11 w-full rounded-lg px-3.5 text-sm text-gray-900
          border border-gray-200 bg-white
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
          transition-all duration-150
          ${error ? 'border-red-300 focus:ring-red-100' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});
