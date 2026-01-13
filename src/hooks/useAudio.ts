import { useRef, useCallback } from 'react';

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const humOscillatorRef = useRef<OscillatorNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      startHum();
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  const startHum = useCallback(() => {
    if (!audioContextRef.current) return;
    
    humOscillatorRef.current = audioContextRef.current.createOscillator();
    const humGain = audioContextRef.current.createGain();
    
    humOscillatorRef.current.type = 'sine';
    humOscillatorRef.current.frequency.setValueAtTime(50, audioContextRef.current.currentTime);
    humGain.gain.setValueAtTime(0.006, audioContextRef.current.currentTime);
    
    humOscillatorRef.current.connect(humGain);
    humGain.connect(audioContextRef.current.destination);
    humOscillatorRef.current.start();
  }, []);

  const playTypeSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filter = audioContextRef.current.createBiquadFilter();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1200 + Math.random() * 400, audioContextRef.current.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    
    gainNode.gain.setValueAtTime(0.008, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.025);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.025);
  }, []);

  const playSubmitSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.025, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.12);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.12);
  }, []);

  const playBeep = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
    gainNode.gain.setValueAtTime(0.012, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.08);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.08);
  }, []);

  const playGlitchSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const bufferSize = audioContextRef.current.sampleRate * 0.1;
    const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    
    const source = audioContextRef.current.createBufferSource();
    const gainNode = audioContextRef.current.createGain();
    const filter = audioContextRef.current.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    
    source.buffer = buffer;
    gainNode.gain.setValueAtTime(0.02, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.1);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    source.start();
  }, []);

  return {
    initAudio,
    playTypeSound,
    playSubmitSound,
    playBeep,
    playGlitchSound,
    isAudioInitialized: () => !!audioContextRef.current,
  };
}
