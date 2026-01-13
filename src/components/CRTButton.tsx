import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

interface CRTButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'submit';
}

export function CRTButton({ 
  children, 
  className,
  variant = 'default',
  ...props 
}: CRTButtonProps) {
  return (
    <button
      className={cn(
        "bg-transparent border border-primary/45 text-primary px-8 py-2.5",
        "text-[clamp(0.9rem,2.2vw,1.1rem)] font-bold font-[inherit]",
        "cursor-pointer transition-all duration-300",
        "opacity-75 rounded-md",
        "hover:opacity-100 hover:border-primary/70",
        "focus:outline-none focus:border-primary/70",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-primary/45",
        variant === 'submit' && 'mt-5',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
