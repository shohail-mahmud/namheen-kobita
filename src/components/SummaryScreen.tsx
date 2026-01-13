import { useEffect, useState, useCallback } from 'react';
import { CRTButton } from './CRTButton';
import html2canvas from 'html2canvas';

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

export function SummaryScreen({ playerName, answers }: SummaryScreenProps) {
  const [visibleItems, setVisibleItems] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateImages = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      const chunkSize = 3;
      const chunks: Answer[][] = [];
      
      for (let i = 0; i < answers.length; i += chunkSize) {
        chunks.push(answers.slice(i, i + chunkSize));
      }

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '1080px';
        container.style.height = '1350px';
        container.style.background = 'linear-gradient(180deg, hsl(215, 55%, 9%) 0%, hsl(215, 55%, 6%) 100%)';
        container.style.padding = '60px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.fontFamily = "'Noto Sans Bengali', sans-serif";
        
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '40px';
        header.innerHTML = `
          <div style="color: hsl(45, 73%, 56%); font-size: 32px; font-weight: bold; margin-bottom: 16px; text-shadow: 0 0 20px hsla(45, 73%, 56%, 0.3);">
            বাংলা কবিতার ভেতরে
          </div>
          <div style="color: hsla(45, 73%, 56%, 0.5); font-size: 18px;">
            ${playerName || "(নাম দেওয়া হয়নি)"} — পর্ব ${chunkIndex + 1}/${chunks.length}
          </div>
        `;
        container.appendChild(header);
        
        const answersContainer = document.createElement('div');
        answersContainer.style.flex = '1';
        answersContainer.style.display = 'flex';
        answersContainer.style.flexDirection = 'column';
        answersContainer.style.gap = '32px';
        
        chunk.forEach((item) => {
          const answerDiv = document.createElement('div');
          answerDiv.style.padding = '24px';
          answerDiv.style.paddingLeft = '28px';
          answerDiv.style.borderLeft = '3px solid hsla(45, 73%, 56%, 0.3)';
          answerDiv.style.background = 'hsla(215, 55%, 12%, 0.5)';
          answerDiv.style.borderRadius = '8px';
          answerDiv.innerHTML = `
            <div style="color: hsla(45, 73%, 56%, 0.5); font-size: 16px; margin-bottom: 12px; line-height: 1.5;">
              ${item.question.replace(/\n/g, ' ')}
            </div>
            <div style="color: hsl(45, 73%, 56%); font-size: 22px; opacity: 0.9; line-height: 1.4; margin-bottom: 8px;">
              ${item.answer}
            </div>
            <div style="color: hsla(45, 73%, 56%, 0.4); font-size: 14px;">
              — ${item.source}
            </div>
          `;
          answersContainer.appendChild(answerDiv);
        });
        
        container.appendChild(answersContainer);
        
        const footer = document.createElement('div');
        footer.style.textAlign = 'center';
        footer.style.paddingTop = '40px';
        footer.style.marginTop = 'auto';
        footer.innerHTML = `
          <div style="color: hsla(45, 73%, 56%, 0.3); font-size: 16px;">
            @shohailmahmud09
          </div>
        `;
        container.appendChild(footer);
        
        const scanlines = document.createElement('div');
        scanlines.style.position = 'absolute';
        scanlines.style.inset = '0';
        scanlines.style.background = 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04) 1px, transparent 1px, transparent 3px)';
        scanlines.style.pointerEvents = 'none';
        container.appendChild(scanlines);
        
        const vignette = document.createElement('div');
        vignette.style.position = 'absolute';
        vignette.style.inset = '0';
        vignette.style.background = 'radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.4) 100%)';
        vignette.style.pointerEvents = 'none';
        container.appendChild(vignette);
        
        document.body.appendChild(container);
        
        const canvas = await html2canvas(container, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const link = document.createElement('a');
        link.download = `bangla-kobita-${chunkIndex + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        document.body.removeChild(container);
        
        if (chunkIndex < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [answers, playerName]);

  return (
    <div className="absolute inset-0 overflow-y-auto p-9 z-10 summary-scroll bg-crt-screen">
      <div className="text-primary text-[clamp(1.3rem,3.5vw,1.8rem)] font-bold mb-8 text-center opacity-85 text-glow-strong">
        তোমার উত্তরসমূহ
      </div>

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

      {visibleItems >= answers.length + 2 && (
        <div className="text-center mt-8 mb-12">
          <CRTButton onClick={generateImages} disabled={isGenerating}>
            {isGenerating ? 'ছবি তৈরি হচ্ছে...' : 'ছবি ডাউনলোড করো'}
          </CRTButton>
          <div className="text-primary/30 text-[0.75rem] mt-3">
            {Math.ceil(answers.length / 3)}টি ছবি তৈরি হবে
          </div>
        </div>
      )}

      <div className="text-primary text-[clamp(0.75rem,1.8vw,0.9rem)] text-center opacity-25 leading-relaxed whitespace-pre-wrap absolute bottom-5 left-0 right-0 z-[100]">
        ডেভেলপার: Shohail Mahmud
        <br />
        Instagram: <a href="https://instagram.com/shohailmahmud09" target="_blank" rel="noopener noreferrer" className="underline">@shohailmahmud09</a>
      </div>
    </div>
  );
}
