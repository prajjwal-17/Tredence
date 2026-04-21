import { memo, type ReactNode } from 'react';

interface BadgeProps {
  variant: 'error' | 'warning' | 'info';
  children: ReactNode;
}

export const Badge = memo<BadgeProps>(function Badge({ variant, children }) {
  const variants = {
    error: 'bg-red-500 text-white',
    warning: 'bg-amber-400 text-white',
    info: 'bg-gray-500 text-white',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[18px] h-[18px] px-1 rounded-full
        text-[10px] font-bold leading-none
        ${variants[variant]}
      `}
    >
      {children}
    </span>
  );
});
