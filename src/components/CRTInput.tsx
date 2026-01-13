import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface CRTInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const CRTInput = forwardRef<HTMLInputElement, CRTInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "bg-primary/[0.04] border border-primary/35 text-primary",
          "px-5 py-3 text-[clamp(0.9rem,2.2vw,1.1rem)] font-[inherit]",
          "w-full max-w-[320px] text-center outline-none",
          "opacity-85 rounded-lg",
          "focus:opacity-100 focus:border-primary/60",
          "placeholder:text-primary/20",
          className
        )}
        {...props}
      />
    );
  }
);

CRTInput.displayName = 'CRTInput';
