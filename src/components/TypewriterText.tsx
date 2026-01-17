import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string;
  showCursor?: boolean;
  className?: string;
  glitchClass?: string;
  dataText?: string;
}

export function TypewriterText({ 
  text, 
  showCursor = false, 
  className,
  glitchClass,
  dataText,
}: TypewriterTextProps) {
  return (
    <div 
      className={cn(
        "text-primary font-bold text-[clamp(0.95rem,2.5vw,1.5rem)] leading-[1.22] whitespace-pre-wrap tracking-[0.02em] text-glow",
        glitchClass,
        className
      )}
      data-text={dataText}
    >
      {text}
      {showCursor && (
        <span className="inline-block w-[3px] h-[1em] bg-primary ml-[3px] cursor-blink align-text-bottom opacity-70" />
      )}
    </div>
  );
}
