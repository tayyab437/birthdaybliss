import { useEffect, useRef } from 'react';

interface AudioControllerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function AudioController({ isPlaying, setIsPlaying }: AudioControllerProps) {
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const confettiSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio elements
    bgMusicRef.current = new Audio('/audio/happy-birthday.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.4;
    
    clickSoundRef.current = new Audio('/audio/click.mp3');
    clickSoundRef.current.volume = 0.3;
    
    confettiSoundRef.current = new Audio('/audio/confetti.mp3');
    confettiSoundRef.current.volume = 0.5;
    
    // Clean up when component unmounts
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current = null;
      }
      clickSoundRef.current = null;
      confettiSoundRef.current = null;
    };
  }, []);
  
  // Control background music
  useEffect(() => {
    if (bgMusicRef.current) {
      if (isPlaying) {
        bgMusicRef.current.play().catch((error) => {
          console.error("Audio playback was prevented:", error);
          setIsPlaying(false);
        });
      } else {
        bgMusicRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    const handlePauseBg = () => {
      setIsPlaying(false);
    };
    window.addEventListener('pause-bg-music', handlePauseBg);
    return () => {
      window.removeEventListener('pause-bg-music', handlePauseBg);
    };
  }, [setIsPlaying]);
  
  // Expose audio functions globally for other components to use
  useEffect(() => {
    // @ts-ignore - Adding to window for other components to access
    window.playClickSound = () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.currentTime = 0;
        clickSoundRef.current.play().catch(() => {});
      }
    };
    
    // @ts-ignore - Adding to window for other components to access
    window.playConfettiSound = () => {
      if (confettiSoundRef.current) {
        confettiSoundRef.current.currentTime = 0;
        confettiSoundRef.current.play().catch(() => {});
      }
    };
    
    return () => {
      // @ts-ignore - Clean up global functions
      delete window.playClickSound;
      // @ts-ignore - Clean up global functions
      delete window.playConfettiSound;
    };
  }, []);
  
  return null; // No visual component, just audio management
}
