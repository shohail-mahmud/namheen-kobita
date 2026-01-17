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

  const addSubtleEffects = (container: HTMLDivElement) => {
    // Only add subtle scanlines - no blocking glitch effects
    const scanlines = document.createElement('div');
    scanlines.style.position = 'absolute';
    scanlines.style.inset = '0';
    scanlines.style.background = 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03) 1px, transparent 1px, transparent 3px)';
    scanlines.style.pointerEvents = 'none';
    container.appendChild(scanlines);
    
    // Subtle vignette
    const vignette = document.createElement('div');
    vignette.style.position = 'absolute';
    vignette.style.inset = '0';
    vignette.style.background = 'radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.25) 100%)';
    vignette.style.pointerEvents = 'none';
    container.appendChild(vignette);
  };


  const generateCoverImage = useCallback(async () => {
    const width = 1080;
    const height = 1350;
    
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.background = 'hsl(215, 55%, 9%)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.fontFamily = "'Noto Sans Bengali', sans-serif";
    container.style.overflow = 'hidden';
    container.style.textAlign = 'center';

    // Decorative top border
    const topBorder = document.createElement('div');
    topBorder.style.position = 'absolute';
    topBorder.style.top = '60px';
    topBorder.style.left = '60px';
    topBorder.style.right = '60px';
    topBorder.style.height = '2px';
    topBorder.style.background = 'linear-gradient(90deg, transparent, hsla(45, 73%, 56%, 0.4), transparent)';
    container.appendChild(topBorder);

    // Decorative bottom border
    const bottomBorder = document.createElement('div');
    bottomBorder.style.position = 'absolute';
    bottomBorder.style.bottom = '60px';
    bottomBorder.style.left = '60px';
    bottomBorder.style.right = '60px';
    bottomBorder.style.height = '2px';
    bottomBorder.style.background = 'linear-gradient(90deg, transparent, hsla(45, 73%, 56%, 0.4), transparent)';
    container.appendChild(bottomBorder);

    // Main title
    const title = document.createElement('div');
    title.style.color = 'hsl(45, 73%, 56%)';
    title.style.fontSize = '72px';
    title.style.fontWeight = 'bold';
    title.style.textShadow = '0 0 40px hsla(45, 73%, 56%, 0.5), 0 0 80px hsla(45, 73%, 56%, 0.3)';
    title.style.marginBottom = '40px';
    title.style.lineHeight = '1.3';
    title.textContent = 'বাংলা কবিতার\nভেতরে';
    title.style.whiteSpace = 'pre-wrap';
    container.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.style.color = 'hsla(45, 73%, 56%, 0.6)';
    subtitle.style.fontSize = '24px';
    subtitle.style.marginBottom = '80px';
    subtitle.style.letterSpacing = '4px';
    subtitle.textContent = '— একটি আত্মচিন্তনমূলক যাত্রা —';
    container.appendChild(subtitle);

    // Decorative divider
    const divider = document.createElement('div');
    divider.style.width = '200px';
    divider.style.height = '1px';
    divider.style.background = 'hsla(45, 73%, 56%, 0.3)';
    divider.style.marginBottom = '60px';
    container.appendChild(divider);

    // Player name
    const nameLabel = document.createElement('div');
    nameLabel.style.color = 'hsla(45, 73%, 56%, 0.4)';
    nameLabel.style.fontSize = '18px';
    nameLabel.style.marginBottom = '12px';
    nameLabel.textContent = 'যাত্রী';
    container.appendChild(nameLabel);

    const playerNameEl = document.createElement('div');
    playerNameEl.style.color = 'hsl(45, 73%, 56%)';
    playerNameEl.style.fontSize = '36px';
    playerNameEl.style.fontWeight = 'bold';
    playerNameEl.style.textShadow = '0 0 20px hsla(45, 73%, 56%, 0.3)';
    playerNameEl.style.marginBottom = '40px';
    playerNameEl.textContent = playerName || "(নাম দেওয়া হয়নি)";
    container.appendChild(playerNameEl);

    // Answer count
    const countEl = document.createElement('div');
    countEl.style.color = 'hsla(45, 73%, 56%, 0.5)';
    countEl.style.fontSize = '20px';
    countEl.textContent = `${answers.length}টি প্রশ্নের উত্তর`;
    container.appendChild(countEl);

    // Footer with watermark
    const footer = document.createElement('div');
    footer.style.position = 'absolute';
    footer.style.bottom = '100px';
    footer.style.left = '0';
    footer.style.right = '0';
    footer.style.textAlign = 'center';
    footer.innerHTML = `
      <div style="color: hsla(45, 73%, 56%, 0.3); font-size: 16px;">
        @shohailmahmud09
      </div>
    `;
    container.appendChild(footer);

    // Add subtle effects only
    addSubtleEffects(container);

    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = 'bangla-kobita-cover.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    document.body.removeChild(container);
  }, [playerName, answers.length]);

  const generateImages = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // First, generate cover image
      await generateCoverImage();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to fit all answers in one image first, otherwise split
      const maxPerImage = 10;
      const chunkSize = answers.length <= maxPerImage ? answers.length : Math.ceil(answers.length / 2);
      const chunks: Answer[][] = [];
      
      for (let i = 0; i < answers.length; i += chunkSize) {
        chunks.push(answers.slice(i, i + chunkSize));
      }

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const width = 1080;
        const gap = 20;
        
        // Create container with auto height first to measure
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = `${width}px`;
        container.style.background = 'hsl(215, 55%, 9%)';
        container.style.padding = '50px';
        container.style.paddingBottom = '80px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.fontFamily = "'Noto Sans Bengali', sans-serif";
        
        const header = document.createElement('div');
        header.style.textAlign = 'center';
        header.style.marginBottom = '30px';
        header.style.flexShrink = '0';
        header.innerHTML = `
          <div style="color: hsl(45, 73%, 56%); font-size: 28px; font-weight: bold; margin-bottom: 12px; text-shadow: 0 0 20px hsla(45, 73%, 56%, 0.3);">
            বাংলা কবিতার ভেতরে
          </div>
          <div style="color: hsla(45, 73%, 56%, 0.5); font-size: 16px;">
            ${playerName || "(নাম দেওয়া হয়নি)"}${chunks.length > 1 ? ` — পর্ব ${chunkIndex + 1}/${chunks.length}` : ''}
          </div>
        `;
        container.appendChild(header);
        
        const answersContainer = document.createElement('div');
        answersContainer.style.display = 'flex';
        answersContainer.style.flexDirection = 'column';
        answersContainer.style.gap = `${gap}px`;
        
        chunk.forEach((item) => {
          const answerDiv = document.createElement('div');
          answerDiv.style.padding = '16px';
          answerDiv.style.paddingLeft = '20px';
          answerDiv.style.borderLeft = '3px solid hsla(45, 73%, 56%, 0.3)';
          answerDiv.style.background = 'hsla(215, 55%, 12%, 0.5)';
          answerDiv.style.borderRadius = '6px';
          answerDiv.innerHTML = `
            <div style="color: hsla(45, 73%, 56%, 0.6); font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
              ${item.question.replace(/\n/g, ' ')} <span style="color: hsla(45, 73%, 56%, 0.4);">— ${item.source}</span>
            </div>
            <div style="color: hsl(45, 73%, 56%); font-size: 18px; opacity: 0.9; line-height: 1.35;">
              ${item.answer}
            </div>
          `;
          answersContainer.appendChild(answerDiv);
        });
        
        container.appendChild(answersContainer);
        
        const footer = document.createElement('div');
        footer.style.textAlign = 'center';
        footer.style.paddingTop = '30px';
        footer.style.flexShrink = '0';
        footer.innerHTML = `
          <div style="color: hsla(45, 73%, 56%, 0.4); font-size: 14px;">
            @shohailmahmud09
          </div>
        `;
        container.appendChild(footer);
        
        // Add subtle effects only
        addSubtleEffects(container);
        
        document.body.appendChild(container);
        
        const canvas = await html2canvas(container, {
          backgroundColor: null,
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const link = document.createElement('a');
        link.download = chunks.length === 1 ? 'bangla-kobita-answers.png' : `bangla-kobita-${chunkIndex + 1}.png`;
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
  }, [answers, playerName, generateCoverImage]);

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
            <div className="text-primary/50 text-[clamp(0.85rem,2vw,1rem)] mb-2 leading-tight">
              {item.question.replace(/\n/g, ' ')} <span className="text-primary/40">— {item.source}</span>
            </div>
            <div className="text-primary text-[clamp(0.95rem,2.3vw,1.1rem)] opacity-80 leading-[1.22]">
              {item.answer}
            </div>
          </div>
        )
      ))}

      {visibleItems >= answers.length + 2 && (
        <div className="text-center mt-8 mb-8 animate-fade-in">
          <CRTButton onClick={generateImages} disabled={isGenerating}>
            {isGenerating ? 'ছবি তৈরি হচ্ছে...' : 'ছবি ডাউনলোড করো'}
          </CRTButton>
          <div className="text-primary/30 text-[0.75rem] mt-3">
            {answers.length <= 7 ? '২টি ছবি তৈরি হবে (১টি কভার + ১টি উত্তর)' : `${Math.ceil(answers.length / 5) + 1}টি ছবি তৈরি হবে`}
          </div>
          
          {/* Developer credit below button */}
          <div className="text-primary text-[clamp(0.75rem,1.8vw,0.9rem)] opacity-25 leading-relaxed whitespace-pre-wrap mt-8">
            ডেভেলপার: Shohail Mahmud
            <br />
            Instagram: <a href="https://instagram.com/shohailmahmud09" target="_blank" rel="noopener noreferrer" className="underline">@shohailmahmud09</a>
          </div>
        </div>
      )}
    </div>
  );
}
