import { useEffect, useState } from 'react';
import FloatingParticles from './FloatingParticles';

interface WelcomePageProps {
  onEnter: () => void;
}

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mount
    setLoaded(true);
  }, []);

  return (
    <section 
      id="welcome" 
      className="section relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/30 to-primary/30"
    >
      <div className="welcome-animation relative z-10 text-center">
        <h1 className="cursive text-4xl md:text-7xl font-bold text-neutral-dark animate-glow mb-4">
          Happy Birthday
        </h1>
        <div className="overflow-hidden">
          <h2 className="cursive text-5xl md:text-8xl text-primary drop-shadow-lg animate-writing overflow-hidden whitespace-nowrap inline-block">
            Zainab
          </h2>
        </div>
        <div 
          className={`mt-16 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} 
          style={{ animationDelay: '2s' }}
        >
          <button 
            onClick={onEnter}
            className="px-8 py-3 bg-accent text-white rounded-full font-semibold hover:bg-opacity-90 transition-all"
          >
            <span className="mr-2">Click to Celebrate</span>
            <i className='bx bx-party'></i>
          </button>
        </div>
      </div>
      
      <FloatingParticles />
    </section>
  );
}
