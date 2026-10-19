import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingParticles from './FloatingParticles';

interface WelcomePageProps {
  onEnter: () => void;
}

interface FallingSparkle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  emoji: string;
  size: number;
}

export default function WelcomePage({ onEnter }: WelcomePageProps) {
  const [loaded, setLoaded] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [sparkles, setSparkles] = useState<FallingSparkle[]>([]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const triggerCelebration = () => {
    if (isCelebrating) return;
    setIsCelebrating(true);

    // Play celebration audio
    try {
      const audio = new Audio('/confetti.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch {}

    // Generate falling birthday sparkles/confetti
    const symbols = ['✨', '⭐', '🎈', '💖', '🎉', '🌸', '💫'];
    const list: FallingSparkle[] = [];
    for (let i = 0; i < 35; i++) {
      list.push({
        id: i,
        x: Math.random() * window.innerWidth,
        delay: Math.random() * 1.5,
        duration: Math.random() * 2 + 2.5,
        emoji: symbols[Math.floor(Math.random() * symbols.length)],
        size: Math.floor(Math.random() * 16) + 16,
      });
    }
    setSparkles(list);

    // After the bear slowly crosses the screen (5 seconds), transition to next section
    setTimeout(() => {
      setIsCelebrating(false);
      onEnter();
    }, 5000);
  };

  return (
    <section 
      id="welcome" 
      className="section relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/30 via-pink-100/60 to-primary/30"
    >
      <div className="welcome-animation relative z-10 text-center px-4">
        <h1 className="cursive text-4xl md:text-7xl font-bold text-neutral-dark animate-glow mb-4">
          Happy Birthday
        </h1>
        <div className="overflow-hidden">
          <h2 className="cursive text-5xl md:text-8xl font-bold text-rose-600 drop-shadow-md animate-writing overflow-hidden whitespace-nowrap inline-block">
            Aqsa
          </h2>
        </div>

        <div 
          className={`mt-16 ${loaded ? 'animate-fade-in' : 'opacity-0'}`} 
          style={{ animationDelay: '2s' }}
        >
          <motion.button 
            onClick={triggerCelebration}
            whileHover={{ scale: 1.08, boxShadow: "0px 10px 25px rgba(255, 107, 129, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white rounded-full font-bold text-lg shadow-xl hover:opacity-95 transition-all flex items-center gap-3 mx-auto"
          >
            <span className="text-2xl">🧸</span>
            <span>Click to Celebrate</span>
            <span className="text-2xl">🎉</span>
          </motion.button>
        </div>
      </div>

      {/* Cute Bear with Happy Birthday Flag & Falling Sparkles Animation */}
      <AnimatePresence>
        {isCelebrating && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Falling Celebration Sparkles / Confetti Shower */}
            {sparkles.map((item) => (
              <motion.div
                key={item.id}
                initial={{ 
                  x: item.x, 
                  y: -50, 
                  opacity: 0, 
                  rotate: 0 
                }}
                animate={{ 
                  y: window.innerHeight + 50, 
                  opacity: [0, 1, 1, 0],
                  rotate: 360,
                  x: item.x + (Math.random() * 100 - 50)
                }}
                transition={{ 
                  duration: item.duration, 
                  delay: item.delay, 
                  ease: "easeInOut",
                  repeat: Infinity
                }}
                className="absolute select-none"
                style={{ fontSize: `${item.size}px` }}
              >
                {item.emoji}
              </motion.div>
            ))}

            {/* Slower, Graceful Marching Cute Bear with Banner */}
            <motion.div
              initial={{ x: -300, y: "42%" }}
              animate={{ 
                x: window.innerWidth + 300, 
                y: ["42%", "38%", "45%", "40%"],
              }}
              transition={{ duration: 4.8, ease: "easeInOut" }}
              className="absolute flex items-center gap-3 drop-shadow-2xl"
            >
              {/* Cute Bear Emoji / Avatar */}
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="text-7xl md:text-9xl select-none"
                >
                  🧸
                </motion.div>
                {/* Party Hat on Bear */}
                <span className="absolute -top-6 left-6 text-4xl md:text-5xl animate-bounce">
                  🎉
                </span>
              </div>

              {/* Happy Birthday Banner / Flag */}
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl border-4 border-white flex items-center gap-3 text-base md:text-2xl whitespace-nowrap"
              >
                <span className="text-2xl">🚩</span>
                <span className="cursive text-xl md:text-3xl font-extrabold tracking-wide">
                  Happy Birthday Aqsa! 💖
                </span>
                <span className="text-2xl">✨</span>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <FloatingParticles />
    </section>
  );
}
