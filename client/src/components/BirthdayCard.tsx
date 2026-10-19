import { useState } from 'react';

interface BirthdayCardProps {
  audioPlaying: boolean;
  onToggleAudio: () => void;
}

export default function BirthdayCard({ audioPlaying, onToggleAudio }: BirthdayCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const toggleCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  return (
    <section 
      id="birthday-card" 
      className="section bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full">
        <h2 className="text-3xl md:text-4xl text-center mb-6 font-bold">Your Special Card</h2>
        <p className="text-center mb-4 text-neutral-dark/70">Tap or click to open</p>
        
        <div 
          className={`flip-card w-full h-96 mb-8 mx-auto cursor-pointer ${isFlipped ? 'active' : ''}`} 
          onClick={toggleCard}
        >
          <div className="flip-card-inner relative w-full h-full">
            {/* Card Front */}
            <div className="flip-card-front absolute w-full h-full rounded-xl flex items-center justify-center p-5 shadow-lg bg-white border-4 border-accent">
              <div className="text-center">
                <div className="text-6xl mb-3">🎁</div>
                <h3 className="cursive text-3xl text-accent mb-2">For Aqsa</h3>
                <p className="text-sm text-neutral-dark/70">Click to open</p>
              </div>
            </div>
            
            {/* Card Back */}
            <div className="flip-card-back absolute w-full h-full rounded-xl p-8 shadow-lg bg-white border-4 border-accent overflow-y-auto">
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <h3 className="cursive text-2xl md:text-3xl text-accent mb-4">Dear Aqsa,</h3>
                  <p className="text-sm md:text-base mb-4 leading-relaxed">
                    On your special day, I want to celebrate all the joy and light you bring to the world. Your company means more than words can express.
                  </p>
                  <p className="text-sm md:text-base mb-6 leading-relaxed">
                    Here's to another year of laughter, growth, and beautiful memories together.
                  </p>
                </div>
                <div>
                  <p className="cursive text-xl md:text-2xl text-accent">Happy Birthday!</p>
                  <p className="mt-2 font-medium">Sincerity,</p>
                  <p className="cursive text-xl">Tayyab Ashfaq</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Music Controls */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button 
            onClick={onToggleAudio}
            className="flex items-center justify-center rounded-full w-12 h-12 bg-white shadow-md hover:shadow-lg transition-all text-accent"
          >
            <i className={`bx ${audioPlaying ? 'bx-pause' : 'bx-music'} text-2xl`}></i>
          </button>
          <div className="text-sm text-neutral-dark/70">
            <span>Music: {audioPlaying ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
