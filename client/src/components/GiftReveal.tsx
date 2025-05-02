import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GiftReveal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleOpenGift = () => {
    if (!isOpen) {
      setIsOpen(true);
      playConfettiSound();
    }
  };
  
  const playConfettiSound = () => {
    const confettiSound = new Audio('/confetti.mp3');
    confettiSound.volume = 0.5;
    confettiSound.play().catch(() => {});
  };

  return (
    <section 
      id="gift-reveal" 
      className="section bg-gradient-to-tr from-secondary/20 to-primary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">A Special Surprise</h2>
      <p className="cursive text-xl text-accent text-center mb-12">Click to unwrap your gift</p>
      
      <div className="gift-container relative max-w-md w-full aspect-square">
        {/* Closed Gift Box */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="gift-box absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={handleOpenGift}
            >
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Gift box" 
                  className="w-60 h-60 object-cover rounded-lg shadow-lg mx-auto" 
                />
                <p className="mt-4 text-neutral-dark/80">Click to open</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Open Gift Box / Gift Reveal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center bg-white rounded-xl p-8 shadow-xl"
              >
                <div className="text-6xl mb-4">🎊</div>
                <h3 className="text-2xl font-bold mb-4">Your Special Gift!</h3>
                <p className="mb-6 text-neutral-dark/80">
                  I've arranged a special surprise for you! Check your messages for details about your real gift.
                </p>
                <div className="cursive text-xl text-accent">
                  Because you deserve to be celebrated!
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Confetti effect when opened */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                ease: "linear"
              }}
              className="absolute w-4 h-4 text-lg"
              style={{
                color: `hsl(${Math.random() * 360}, 100%, 70%)`,
              }}
            >
              {['🎊', '✨', '🎉', '🎁', '🎈'][Math.floor(Math.random() * 5)]}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
