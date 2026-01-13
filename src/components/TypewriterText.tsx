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
        "text-primary font-bold text-[clamp(1.1rem,3vw,1.9rem)] leading-[1.22] whitespace-pre-wrap tracking-[0.02em] text-glow",
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
