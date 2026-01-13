interface LoadingBarProps {
  progress: number;
  visible: boolean;
}

export function LoadingBar({ progress, visible }: LoadingBarProps) {
  if (!visible) return null;

  return (
    <div className="w-40 h-[3px] border border-primary/30 mt-8 relative opacity-55 rounded-sm">
      <div 
        className="h-full bg-primary opacity-65 rounded-sm transition-[width] duration-400 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
