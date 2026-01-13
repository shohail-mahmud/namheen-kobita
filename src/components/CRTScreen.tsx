import { ReactNode, useState, useEffect } from 'react';
import { StaticNoise } from './StaticNoise';

interface CRTScreenProps {
  children: ReactNode;
}

export function CRTScreen({ children }: CRTScreenProps) {
  const [isFlickering, setIsFlickering] = useState(false);

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      if (Math.random() < 0.03) {
        setIsFlickering(true);
        setTimeout(() => setIsFlickering(false), 50 + Math.random() * 80);
      }
    }, 2500);

    return () => clearInterval(flickerInterval);
  }, []);

  return (
    <div className="w-[min(94vw,880px)] aspect-[4/3] relative rounded-[28px] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]">
      <div
        className={`w-full h-full bg-background relative flex justify-center items-center overflow-hidden rounded-[28px] transition-[filter] duration-50 ${
          isFlickering ? 'brightness-90' : ''
        }`}
      >
        <StaticNoise />
        
        {/* Scanlines */}
        <div className="absolute inset-0 crt-scanlines pointer-events-none z-[100]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 crt-vignette pointer-events-none z-[99]" />
        
        {children}
      </div>
    </div>
  );
}
