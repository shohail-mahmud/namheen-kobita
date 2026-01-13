import { useEffect, useState } from 'react';
import { CRTButton } from './CRTButton';

interface Answer {
  question: string;
  answer: string;
  source: string;
}

interface SummaryScreenProps {
  playerName: string;
  answers: Answer[];
  onDownload: () => void;
}

export function SummaryScreen({ playerName, answers, onDownload }: SummaryScreenProps) {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleItems(prev => {
        if (prev >= answers.length + 2) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [answers.length]);

  return (
    <div className="absolute inset-0 overflow-y-auto p-9 z-10 summary-scroll">
      {/* Title */}
      <div className="text-primary text-[clamp(1.3rem,3.5vw,1.8rem)] font-bold mb-8 text-center opacity-85 text-glow-strong">
        তোমার উত্তরসমূহ
      </div>

      {/* Stats */}
      {visibleItems >= 1 && (
        <div className="mb-6 text-left px-4 border-l-2 border-primary/15 animate-fade-in">
          <div className="text-primary/40 text-[clamp(0.85rem,2vw,1rem)] leading-tight">
            নাম: {playerName || "(নাম দেওয়া হয়নি)"}
          </div>
          <div className="text-primary/40 text-[clamp(0.85rem,2vw,1rem)] leading-tight mt-1">
            মোট উত্তর দেওয়া হয়েছে: {answers.length}টি
          </div>
        </div>
      )}

      {/* Answers */}
      {answers.map((item, index) => (
        visibleItems >= index + 2 && (
          <div 
            key={index} 
            className="mb-6 text-left px-4 border-l-2 border-primary/15 animate-fade-in"
          >
            <div className="text-primary/40 text-[clamp(0.85rem,2vw,1rem)] mb-1 leading-tight">
              {item.question.replace(/\n/g, ' ')}
            </div>
            <div className="text-primary text-[clamp(0.95rem,2.3vw,1.1rem)] opacity-80 leading-[1.22]">
              {item.answer}
            </div>
            <div className="text-primary/40 text-[0.8rem] mt-1">
              — {item.source}
            </div>
          </div>
        )
      ))}

      {/* Download button */}
      {visibleItems >= answers.length + 2 && (
        <div className="text-center mt-8 mb-12">
          <CRTButton onClick={onDownload}>
            ডাউনলোড করো
          </CRTButton>
        </div>
      )}

      {/* Developer credit */}
      <div className="text-primary text-[clamp(0.75rem,1.8vw,0.9rem)] text-center opacity-25 leading-relaxed whitespace-pre-wrap absolute bottom-5 left-0 right-0 z-[100]">
        ডেভেলপার: Shohail Mahmud
        <br />
        Instagram: <a href="https://instagram.com/shohailmahmud09" target="_blank" rel="noopener noreferrer" className="underline">@shohailmahmud09</a>
      </div>
    </div>
  );
}
