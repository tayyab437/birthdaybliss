import { useRef, useState, useEffect } from 'react';
import WelcomePage from '@/components/WelcomePage';
import BirthdayCard from '@/components/BirthdayCard';
import PuzzleGame from '@/components/PuzzleGame';
import SpecialQualities from '@/components/SpecialQualities';
import GiftReveal from '@/components/GiftReveal';
import MessageWall from '@/components/MessageWall';
import BirthdayCountdown from '@/components/BirthdayCountdown';
import BirthdayCake from '@/components/BirthdayCake';
import AudioController from '@/components/AudioController';
import WordScrambleGame from '@/components/WordScrambleGame';
import ImageSliderPuzzle from '@/components/ImageSliderPuzzle';
import DigitalEscapeRoom from '@/components/DigitalEscapeRoom';
import InteractiveBirthdayPlaylist from '@/components/InteractiveBirthdayPlaylist';

import BirthdayAvatarCreator from '@/components/BirthdayAvatarCreator';
import NavigationButtons from '@/components/NavigationButtons';
import PageLoader from '@/components/PageLoader';

// Define sections for navigation
const sections = [
  'welcome',
  'birthday-card',
  'puzzle-game',
  'word-scramble-game',
  'image-slider-puzzle',
  'digital-escape-room',
  'special-qualities',
  'gift-reveal',
  'message-wall',
  'birthday-playlist',
  'birthday-avatar-creator',
  'birthday-countdown',
  'birthday-cake'
];

export default function BirthdaySite() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState('welcome');
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Handle scrolling to update current section
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const sectionElements = containerRef.current.querySelectorAll('.section');
    let currentSectionId = '';
    
    sectionElements.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom >= 100) {
        currentSectionId = section.id;
      }
    });
    
    if (currentSectionId && currentSectionId !== currentSection) {
      setCurrentSection(currentSectionId);
    }
  };

  // Navigate to section
  const navigateToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <>
      <PageLoader delay={2000} />
      
      <div 
        ref={containerRef} 
        className="main-container" 
        data-current-section={currentSection}
      >
        <WelcomePage onEnter={() => navigateToSection('birthday-card')} />
        <BirthdayCard 
          audioPlaying={audioPlaying} 
          onToggleAudio={() => setAudioPlaying(!audioPlaying)} 
        />
        <PuzzleGame onPuzzleComplete={() => navigateToSection('word-scramble-game')} />
        <WordScrambleGame onGameComplete={() => navigateToSection('image-slider-puzzle')} />
        <ImageSliderPuzzle onPuzzleComplete={() => navigateToSection('digital-escape-room')} />
        <DigitalEscapeRoom onComplete={() => navigateToSection('special-qualities')} />
        <SpecialQualities />
        <GiftReveal />
        <MessageWall />
        <InteractiveBirthdayPlaylist />
        <BirthdayAvatarCreator />
        <BirthdayCountdown />
        <BirthdayCake />
      </div>
      
      <AudioController 
        isPlaying={audioPlaying} 
        setIsPlaying={setAudioPlaying} 
      />

      <NavigationButtons 
        currentSection={currentSection}
        navigateToSection={navigateToSection}
        sections={sections}
      />
    </>
  );
}
