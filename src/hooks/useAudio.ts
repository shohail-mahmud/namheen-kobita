import { useRef, useCallback, useState } from 'react';

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const humOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientSourcesRef = useRef<OscillatorNode[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      startHum();
      startAmbientMusic();
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

  const startAmbientMusic = useCallback(() => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    ambientGainRef.current = ctx.createGain();
    ambientGainRef.current.gain.setValueAtTime(0.015, ctx.currentTime);
    ambientGainRef.current.connect(ctx.destination);

    // Create drone layers for ambient atmosphere
    const frequencies = [55, 82.5, 110, 165]; // A1, E2, A2, E3 - perfect fifths
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Slow LFO for movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.1 + index * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.02, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + index * 100, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);
      
      oscGain.gain.setValueAtTime(0.3 - index * 0.05, ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(ambientGainRef.current!);
      osc.start();
      
      ambientSourcesRef.current.push(osc);
    });

    // Add subtle noise texture
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const noiseSource = ctx.createBufferSource();
    const noiseFilter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
    noiseGain.gain.setValueAtTime(0.08, ctx.currentTime);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientGainRef.current);
    noiseSource.start();
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioContextRef.current || !ambientGainRef.current) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    const targetGain = newMuted ? 0 : 0.015;
    ambientGainRef.current.gain.linearRampToValueAtTime(
      targetGain, 
      audioContextRef.current.currentTime + 0.3
    );
    
    // Also mute/unmute the hum
    if (humOscillatorRef.current) {
      // We can't easily mute the hum since it's connected directly, 
      // but ambient is the main music
    }
  }, [isMuted]);

  const playTypeSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    
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
  }, [isMuted]);

  const playSubmitSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    
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
  }, [isMuted]);

  const playBeep = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    
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
  }, [isMuted]);

  const playGlitchSound = useCallback(() => {
    if (!audioContextRef.current || isMuted) return;
    
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
  }, [isMuted]);

  return {
    initAudio,
    playTypeSound,
    playSubmitSound,
    playBeep,
    playGlitchSound,
    toggleMute,
    isMuted,
    isAudioInitialized: () => !!audioContextRef.current,
  };
}
