import { useEffect, useRef } from 'react';

export default function FloatingParticles() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Clear existing particles
    container.innerHTML = '';
    
    // Add floating particles (stars and petals)
    const symbols = ['✨', '🌸', '✨', '🌸', '🎀', '✨'];
    const count = 25;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-item animate-float';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.opacity = (Math.random() * 0.5 + 0.3).toString();
      
      // Randomly choose between star, petal, and other decorative elements
      particle.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
      
      particle.style.fontSize = `${Math.random() * 20 + 10}px`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      container.appendChild(particle);
    }
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden" 
      aria-hidden="true"
    />
  );
}
