import { useState, useEffect, useCallback, useRef } from 'react';
import { CRTScreen } from '@/components/CRTScreen';
import { TypewriterText } from '@/components/TypewriterText';
import { CRTButton } from '@/components/CRTButton';
import { CRTInput } from '@/components/CRTInput';
import { LoadingBar } from '@/components/LoadingBar';
import { SummaryScreen } from '@/components/SummaryScreen';
import { useAudio } from '@/hooks/useAudio';
import { questions, shuffleQuestions, Question } from '@/data/questions';

type Screen = 'intro' | 'loading' | 'nameInput' | 'transition' | 'question' | 'pause' | 'end' | 'summary' | 'noResponse';

interface Answer {
  question: string;
  answer: string;
  source: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [smallText, setSmallText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [glitchClass, setGlitchClass] = useState('');
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [inputError, setInputError] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { initAudio, playTypeSound, playSubmitSound, playBeep, playGlitchSound, toggleMute, isMuted } = useAudio();

  const typeText = useCallback(async (text: string, speed = 55) => {
    setDisplayText('');
    setShowCursor(true);

    for (let i = 0; i < text.length; i++) {
      setDisplayText(text.slice(0, i + 1));
      
      if (text[i] !== ' ' && text[i] !== '\n') {
        playTypeSound();
      }
      
      // Occasional glitch during typing
      if (Math.random() < 0.015 && currentScreen === 'question') {
        triggerGlitch();
      }
      
      await sleep(speed);
    }

    await sleep(200);
    setShowCursor(false);
    playBeep();
  }, [playTypeSound, playBeep, currentScreen]);

  const triggerGlitch = useCallback(() => {
    const effects = ['glitch-tear', 'h-distort', 'flicker-glitch'];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    
    setGlitchClass(Math.random() < 0.45 ? `${effect} rgb-split` : effect);
    playGlitchSound();
    
    setTimeout(() => {
      setGlitchClass('');
    }, 180);
  }, [playGlitchSound]);

  const triggerHeavyGlitch = useCallback(() => {
    triggerGlitch();
    setTimeout(() => triggerGlitch(), 80);
    setTimeout(() => triggerGlitch(), 200);
  }, [triggerGlitch]);

  // Random glitch loop
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const intensity = 0.12 + (currentQuestion * 0.025);
      if (Math.random() < intensity && currentScreen === 'question') {
        triggerGlitch();
      }
    }, 1800);

    return () => clearInterval(glitchInterval);
  }, [currentScreen, currentQuestion, triggerGlitch]);

  const resetUI = useCallback(() => {
    setShowOptions(false);
    setShowInput(false);
    setShowLoading(false);
    setSmallText('');
    setDisplayText('');
    setGlitchClass('');
  }, []);

  // Screen handlers
  const showIntroScreen = useCallback(async () => {
    setCurrentScreen('intro');
    resetUI();
    await typeText("তুমি কি প্রস্তুত\nবাংলা কবিতার জগতে প্রবেশ করতে?");
    await sleep(600);
    setShowOptions(true);
  }, [typeText, resetUI]);

  const showNoResponseScreen = useCallback(async () => {
    setCurrentScreen('noResponse');
    resetUI();
    await typeText("ফিরে এসো, যখন তুমি প্রস্তুত হবে জীবনকে বুঝতে।");
  }, [typeText, resetUI]);

  const showLoadingScreen = useCallback(async () => {
    setCurrentScreen('loading');
    resetUI();
    
    const shuffled = shuffleQuestions(questions);
    setShuffledQuestions(shuffled);
    
    await typeText("প্রবেশ করা হচ্ছে...");
    await sleep(1200);
    
    setDisplayText('');
    await typeText("স্মৃতি লোড হচ্ছে", 65);
    
    setShowLoading(true);
    
    for (let i = 0; i <= 100; i += 5) {
      setLoadingProgress(Math.min(i, 100));
      
      if (Math.random() < 0.1 && i > 10 && i < 90) {
        triggerGlitch();
      }
      
      await sleep(220 + Math.random() * 120);
    }
    
    setLoadingProgress(100);
    await sleep(600);
    
    showNameInputScreen();
  }, [typeText, resetUI, triggerGlitch]);

  const showNameInputScreen = useCallback(async () => {
    setCurrentScreen('nameInput');
    resetUI();
    
    await typeText("তোমার নাম লেখো");
    await sleep(400);
    
    setShowInput(true);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [typeText, resetUI]);

  const showTransitionScreen = useCallback(async () => {
    setCurrentScreen('transition');
    resetUI();
    playSubmitSound();
    
    await typeText("নাম গ্রহণ করা হয়েছে");
    await sleep(400);
    
    setSmallText("\nএই নামেই\nতোমাকে ডাকা হবে");
    await sleep(1800);
    
    setDisplayText('');
    setSmallText("এখন তুমি নিজের মনের ভিতরে প্রবেশ করবে।\nভেবে দেখো, অনুভব করো, উত্তর দাও।");
    await sleep(2200);
    
    triggerHeavyGlitch();
    await sleep(700);
    
    showQuestionScreen();
  }, [typeText, resetUI, playSubmitSound, triggerHeavyGlitch]);

  const showQuestionScreen = useCallback(async () => {
    setCurrentScreen('question');
    resetUI();
    
    const q = shuffledQuestions[currentQuestion];
    
    if (Math.random() < 0.2) {
      await sleep(150);
      triggerGlitch();
      await sleep(250);
    }
    
    await typeText(q.text);
    
    await sleep(400);
    setShowInput(true);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [typeText, resetUI, shuffledQuestions, currentQuestion, triggerGlitch]);

  const showPauseScreen = useCallback(async () => {
    setCurrentScreen('pause');
    resetUI();
    
    await typeText("একটু বিশ্রাম নাও।\nচালিয়ে যেতে চাও?");
    
    await sleep(600);
    setShowOptions(true);
  }, [typeText, resetUI]);

  const showEndScreen = useCallback(async () => {
    setCurrentScreen('end');
    resetUI();
    
    triggerHeavyGlitch();
    await sleep(500);
    
    await typeText("এখানেই শেষ নয়।");
    await sleep(2200);
    
    setDisplayText('');
    await typeText("তুমি যা লিখেছ,\nসেগুলোই এখন\nতোমার আয়না।");
    
    await sleep(2500);
    
    setCurrentScreen('summary');
  }, [typeText, resetUI, triggerHeavyGlitch]);

  const submitAnswer = useCallback(async () => {
    const answer = inputValue.trim() || "(কোনো উত্তর দেওয়া হয়নি)";
    const newAnswer = {
      question: shuffledQuestions[currentQuestion].text,
      answer: answer,
      source: shuffledQuestions[currentQuestion].source
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    playSubmitSound();
    
    const nextQuestion = currentQuestion + 1;
    setCurrentQuestion(nextQuestion);
    
    if (nextQuestion < shuffledQuestions.length) {
      if (Math.random() < 0.3) {
        triggerGlitch();
      }
      
      // Pause after every 4 questions
      if (nextQuestion % 4 === 0) {
        await sleep(600);
        showPauseScreen();
      } else {
        await sleep(500);
        showQuestionScreen();
      }
    } else {
      showEndScreen();
    }
  }, [inputValue, shuffledQuestions, currentQuestion, playSubmitSound, triggerGlitch, showPauseScreen, showQuestionScreen, showEndScreen]);

  const handleYesClick = useCallback(() => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
    playSubmitSound();
    
    if (currentScreen === 'intro') {
      showLoadingScreen();
    } else if (currentScreen === 'pause') {
      showQuestionScreen();
    }
  }, [audioInitialized, initAudio, playSubmitSound, currentScreen, showLoadingScreen, showQuestionScreen]);

  const handleNoClick = useCallback(() => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
    playSubmitSound();
    
    if (currentScreen === 'intro') {
      showNoResponseScreen();
    } else if (currentScreen === 'pause') {
      showEndScreen();
    }
  }, [audioInitialized, initAudio, playSubmitSound, currentScreen, showNoResponseScreen, showEndScreen]);

  const handleSubmit = useCallback(() => {
    if (currentScreen === 'nameInput') {
      const name = inputValue.trim();
      if (name === '') {
        setInputError(true);
        setTimeout(() => setInputError(false), 500);
        return;
      }
      setPlayerName(name);
      showTransitionScreen();
    } else if (currentScreen === 'question') {
      submitAnswer();
    }
  }, [currentScreen, inputValue, showTransitionScreen, submitAnswer]);

  const handleDownload = useCallback(() => {
    playSubmitSound();
  }, [playSubmitSound]);

  const handleMuteToggle = useCallback(() => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
    toggleMute();
  }, [audioInitialized, initAudio, toggleMute]);

  // Initialize on mount
  useEffect(() => {
    showIntroScreen();
  }, []);

  return (
    <CRTScreen>
      {/* Audio control */}
      <button 
        onClick={handleMuteToggle}
        className="absolute top-4 right-4 text-primary text-[1.2rem] opacity-40 hover:opacity-70 transition-opacity z-50 cursor-pointer"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {audioInitialized ? (isMuted ? '🔇' : '🔊') : '🔇'}
      </button>

      {currentScreen === 'summary' ? (
        <SummaryScreen
          playerName={playerName}
          answers={answers}
          onDownload={handleDownload}
        />
      ) : (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center w-[88%] max-w-[620px]">
          {/* Main text display */}
          <TypewriterText
            text={displayText}
            showCursor={showCursor}
            glitchClass={glitchClass}
            dataText={glitchClass.includes('rgb-split') ? displayText : undefined}
          />

          {/* Small text */}
          {smallText && (
            <div className="text-primary text-[clamp(0.95rem,2.3vw,1.15rem)] mt-4 opacity-90 whitespace-pre-wrap leading-[1.22]">
              {smallText}
            </div>
          )}

          {/* Yes/No Options */}
          {showOptions && (
            <div className="flex gap-12 mt-10 justify-center animate-fade-in">
              <CRTButton onClick={handleYesClick}>
                {currentScreen === 'pause' ? 'হ্যাঁ, চালাও' : 'হ্যাঁ'}
              </CRTButton>
              <CRTButton onClick={handleNoClick}>
                {currentScreen === 'pause' ? 'এখানেই থামো' : 'না'}
              </CRTButton>
            </div>
          )}

          {/* Input container */}
          {showInput && (
            <div className="flex flex-col items-center mt-8 animate-fade-in">
              <CRTInput
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className={inputError ? 'border-red-500/50' : ''}
              />
              <CRTButton variant="submit" onClick={handleSubmit}>
                {currentScreen === 'nameInput' ? 'জমা দাও' : 'উত্তর দাও'}
              </CRTButton>
            </div>
          )}

          {/* Loading bar */}
          <div className="flex justify-center">
            <LoadingBar progress={loadingProgress} visible={showLoading} />
          </div>
        </div>
      )}

      {/* Developer credit for noResponse screen */}
      {currentScreen === 'noResponse' && (
        <div className="absolute bottom-5 left-0 right-0 text-primary text-[clamp(0.75rem,1.8vw,0.9rem)] text-center opacity-25 leading-relaxed whitespace-pre-wrap z-[100]">
          ডেভেলপার: Shohail Mahmud
          <br />
          Instagram: <a href="https://instagram.com/shohailmahmud09" target="_blank" rel="noopener noreferrer" className="underline">@shohailmahmud09</a>
        </div>
      )}
    </CRTScreen>
  );
}
