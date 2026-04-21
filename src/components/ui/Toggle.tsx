import { memo, type InputHTMLAttributes } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle = memo<ToggleProps>(function Toggle({
  label,
  checked,
  className = '',
  id,
  ...props
}) {
  const toggleId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <label htmlFor={toggleId} className={`inline-flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5 ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div className="h-5 w-9 rounded-full bg-gray-200 transition-colors duration-200 peer-checked:bg-blue-600" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform duration-200" />
      </div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </label>
  );
});
