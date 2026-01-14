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

  const createGlitchEffects = (container: HTMLDivElement, noiseCanvas: HTMLCanvasElement) => {
    // Scanlines overlay
    const scanlines = document.createElement('div');
    scanlines.style.position = 'absolute';
    scanlines.style.inset = '0';
    scanlines.style.background = 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.06) 1px, transparent 1px, transparent 3px)';
    scanlines.style.pointerEvents = 'none';
    container.appendChild(scanlines);
    
    // Vignette overlay
    const vignette = document.createElement('div');
    vignette.style.position = 'absolute';
    vignette.style.inset = '0';
    vignette.style.background = 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)';
    vignette.style.pointerEvents = 'none';
    container.appendChild(vignette);

    // Glitch effect - horizontal tear lines
    for (let g = 0; g < 3; g++) {
      const glitchLine = document.createElement('div');
      const yPos = 15 + Math.random() * 70;
      const height = 2 + Math.random() * 8;
      const xOffset = (Math.random() - 0.5) * 20;
      glitchLine.style.position = 'absolute';
      glitchLine.style.left = `${xOffset}px`;
      glitchLine.style.right = `${-xOffset}px`;
      glitchLine.style.top = `${yPos}%`;
      glitchLine.style.height = `${height}px`;
      glitchLine.style.background = 'hsla(215, 55%, 9%, 0.8)';
      glitchLine.style.mixBlendMode = 'multiply';
      glitchLine.style.pointerEvents = 'none';
      container.appendChild(glitchLine);
    }

    // RGB shift effect - red and cyan shadows
    const rgbShiftR = document.createElement('div');
    rgbShiftR.style.position = 'absolute';
    rgbShiftR.style.inset = '0';
    rgbShiftR.style.background = 'linear-gradient(90deg, rgba(255, 0, 64, 0.03) 0%, transparent 3%, transparent 97%, rgba(255, 0, 64, 0.03) 100%)';
    rgbShiftR.style.pointerEvents = 'none';
    container.appendChild(rgbShiftR);

    const rgbShiftB = document.createElement('div');
    rgbShiftB.style.position = 'absolute';
    rgbShiftB.style.inset = '0';
    rgbShiftB.style.background = 'linear-gradient(90deg, rgba(0, 255, 255, 0.03) 0%, transparent 2%, transparent 98%, rgba(0, 255, 255, 0.03) 100%)';
    rgbShiftB.style.transform = 'translateX(2px)';
    rgbShiftB.style.pointerEvents = 'none';
    container.appendChild(rgbShiftB);

    // Static noise texture
    const noiseOverlay = document.createElement('div');
    noiseOverlay.style.position = 'absolute';
    noiseOverlay.style.inset = '0';
    noiseOverlay.style.backgroundImage = `url(${noiseCanvas.toDataURL()})`;
    noiseOverlay.style.opacity = '0.4';
    noiseOverlay.style.pointerEvents = 'none';
    container.appendChild(noiseOverlay);

    // Chromatic aberration on edges
    const chromaticTop = document.createElement('div');
    chromaticTop.style.position = 'absolute';
    chromaticTop.style.top = '0';
    chromaticTop.style.left = '0';
    chromaticTop.style.right = '0';
    chromaticTop.style.height = '4px';
    chromaticTop.style.background = 'linear-gradient(180deg, rgba(255, 0, 100, 0.15), transparent)';
    chromaticTop.style.pointerEvents = 'none';
    container.appendChild(chromaticTop);

    const chromaticBottom = document.createElement('div');
    chromaticBottom.style.position = 'absolute';
    chromaticBottom.style.bottom = '0';
    chromaticBottom.style.left = '0';
    chromaticBottom.style.right = '0';
    chromaticBottom.style.height = '4px';
    chromaticBottom.style.background = 'linear-gradient(0deg, rgba(0, 255, 255, 0.15), transparent)';
    chromaticBottom.style.pointerEvents = 'none';
    container.appendChild(chromaticBottom);
  };

  const createNoiseCanvas = () => {
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 1080;
    noiseCanvas.height = 1350;
    const noiseCtx = noiseCanvas.getContext('2d');
    if (noiseCtx) {
      const imageData = noiseCtx.createImageData(1080, 1350);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 15;
        imageData.data[i] = noise;
        imageData.data[i + 1] = noise;
        imageData.data[i + 2] = noise;
        imageData.data[i + 3] = 25;
      }
      noiseCtx.putImageData(imageData, 0, 0);
    }
    return noiseCanvas;
  };

  const generateCoverImage = useCallback(async () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1080px';
    container.style.height = '1350px';
    container.style.background = 'linear-gradient(180deg, hsl(215, 55%, 9%) 0%, hsl(215, 55%, 6%) 100%)';
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

    // Add glitch effects
    const noiseCanvas = createNoiseCanvas();
    createGlitchEffects(container, noiseCanvas);

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
        container.style.overflow = 'hidden';
        
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
          <div style="color: hsla(45, 73%, 56%, 0.4); font-size: 16px;">
            @shohailmahmud09
          </div>
        `;
        container.appendChild(footer);
        
        // Add glitch effects
        const noiseCanvas = createNoiseCanvas();
        createGlitchEffects(container, noiseCanvas);
        
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
        <div className="text-center mt-8 mb-8 animate-fade-in">
          <CRTButton onClick={generateImages} disabled={isGenerating}>
            {isGenerating ? 'ছবি তৈরি হচ্ছে...' : 'ছবি ডাউনলোড করো'}
          </CRTButton>
          <div className="text-primary/30 text-[0.75rem] mt-3">
            {Math.ceil(answers.length / 3) + 1}টি ছবি তৈরি হবে (১টি কভার + {Math.ceil(answers.length / 3)}টি উত্তর)
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
