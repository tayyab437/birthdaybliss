import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

export default function BirthdayCake() {
  const [candlesBlown, setCandlesBlown] = useState(0);
  const [totalCandles] = useState(5);
  const [showConfetti, setShowConfetti] = useState(false);
  const candlesContainerRef = useRef<HTMLDivElement>(null);
  const sceneContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize candles
  useEffect(() => {
    if (!candlesContainerRef.current) return;
    
    candlesContainerRef.current.innerHTML = '';
    const container = candlesContainerRef.current;
    
    // Add candles
    const candlePositions = [
      { top: '15%', left: '30%' },
      { top: '10%', left: '50%' },
      { top: '15%', left: '70%' },
      { top: '25%', left: '40%' },
      { top: '25%', left: '60%' }
    ];
    
    candlePositions.forEach((position, index) => {
      const candle = document.createElement('div');
      candle.className = 'cake-candle absolute w-6 h-6 bg-accent rounded-full shadow-lg';
      candle.dataset.index = String(index);
      candle.style.top = position.top;
      candle.style.left = position.left;
      
      const innerCandle = document.createElement('div');
      innerCandle.className = 'w-2 h-4 bg-accent mx-auto relative';
      
      const flame = document.createElement('div');
      flame.className = 'absolute -top-4 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-yellow-300 rounded-full animate-glow';
      
      innerCandle.appendChild(flame);
      candle.appendChild(innerCandle);
      
      candle.addEventListener('click', () => handleCandleClick(index));
      
      container.appendChild(candle);
    });
  }, []);
  
  // Handle candle click
  const handleCandleClick = (index: number) => {
    const candle = candlesContainerRef.current?.querySelector(`[data-index="${index}"]`);
    if (!candle || candle.classList.contains('blown')) return;
    
    candle.classList.add('blown');
    const flame = candle.querySelector('.animate-glow');
    if (flame) {
      flame.classList.remove('animate-glow');
      flame.classList.add('opacity-0');
    }
    
    setCandlesBlown(prev => {
      const newCount = prev + 1;
      
      // Play sound
      const clickSound = new Audio('/click.mp3');
      clickSound.volume = 0.3;
      clickSound.play().catch(() => {});
      
      // If all candles blown, trigger confetti
      if (newCount === totalCandles) {
        setTimeout(() => {
          setShowConfetti(true);
          const confettiSound = new Audio('/confetti.mp3');
          confettiSound.volume = 0.5;
          confettiSound.play().catch(() => {});
        }, 500);
      }
      
      return newCount;
    });
  };
  
  // Initialize Three.js scene for 3D cake (simplified version)
  useEffect(() => {
    if (!sceneContainerRef.current) return;
    
    // Basic Three.js setup would go here in a full implementation
    // For this simplified version, we'll use an animated image instead
    
    return () => {
      // Cleanup Three.js resources
    };
  }, []);
  
  return (
    <section 
      id="birthday-cake" 
      className="section bg-gradient-to-bl from-primary/20 to-secondary/20 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Make a Wish</h2>
        <p className="cursive text-xl text-accent text-center mb-8">Blow out the candles</p>
        
        <div className="cake-container relative max-w-md w-full aspect-square flex items-center justify-center">
          <div className="relative">
            {/* 3D cake container */}
            <div ref={sceneContainerRef} className="w-64 h-64 relative">
              {/* Fallback cake image if Three.js isn't loaded */}
              <img 
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                alt="Birthday cake" 
                className="w-64 h-64 object-cover rounded-lg shadow-xl mx-auto animate-rotate-slow" 
              />
            </div>
            
            {/* Candles container */}
            <div ref={candlesContainerRef} className="absolute inset-0 flex items-center justify-center">
              {/* Candles will be generated here by JavaScript */}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <p className="mb-4 text-neutral-dark/80">Click on the candles to blow them out and make a wish!</p>
          <div className="text-sm font-medium">
            <span>{candlesBlown}</span> out of <span>{totalCandles}</span> candles blown
          </div>
        </div>
      </div>
      
      {/* Confetti container */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: -20,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                  opacity: 1
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: Math.random() * 360,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 4 + 2,
                  ease: "linear"
                }}
                className="absolute w-4 h-4"
                style={{
                  backgroundColor: `hsl(${Math.random() * 360}, 100%, 70%)`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
