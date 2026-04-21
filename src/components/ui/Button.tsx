import { memo, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export const Button = memo<ButtonProps>(function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) {
  const base =
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium leading-none transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
  };

  const variants = {
    primary:
      'bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/25 active:bg-blue-800',
    secondary:
      'border border-gray-300 bg-white text-gray-800 shadow-sm hover:border-gray-400 hover:bg-gray-50 hover:shadow active:bg-gray-100',
    ghost:
      'text-gray-500 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
    danger:
      'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});
