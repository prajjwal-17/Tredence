import { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
}

export const Badge = memo<BadgeProps>(function Badge({
  children,
  variant = 'info',
  size = 'sm',
}) {
  const variantClasses = {
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
});
