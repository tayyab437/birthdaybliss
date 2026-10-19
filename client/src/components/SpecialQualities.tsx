import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useIntersectionObserver from '@/lib/useIntersectionObserver';

// Define special qualities data
const qualities = [
  {
    title: "Yourself",
    description: "I haven't seen someone more amazing than you. Just being genuinely and wonderfully yourself brings so much warmth, joy, and light to everyone who knows you.",
    color: "border-accent"
  },
  {
    title: "Your Creativity",
    description: "The way you approach problems with innovative solutions and see the world from unique perspectives brings so much inspiration to those around you.",
    color: "border-secondary"
  },
  {
    title: "Your Strength",
    description: "Your resilience in the face of challenges is remarkable. You handle difficult situations with grace and emerge even stronger.",
    color: "border-primary"
  },
  {
    title: "Your Smile & Voice",
    description: "I miss your smile so much, your sweet way of talking, your laughter, and honestly every single thing about you. Being around you brings a kind of happiness that nothing else in the world can match.",
    color: "border-accent"
  },
  {
    title: "Your Friendship",
    description: "You're the kind of friend everyone wishes for - loyal, understanding, and always there when needed. I'm grateful for our connection.",
    color: "border-secondary"
  }
];

export default function SpecialQualities() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { observedElements, observeElement } = useIntersectionObserver({
    threshold: 0.1,
    root: null,
    rootMargin: '0px',
  });

  useEffect(() => {
    const qualityItems = containerRef.current?.querySelectorAll('.quality-item');
    if (qualityItems) {
      qualityItems.forEach((item, index) => {
        observeElement(item as HTMLElement, index);
      });
    }
  }, [observeElement]);

  return (
    <section 
      id="special-qualities" 
      className="section bg-gradient-to-bl from-primary/20 to-secondary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Why You're Amazing</h2>
      <p className="cursive text-xl text-accent text-center mb-12">The qualities that make you special</p>
      
      <div ref={containerRef} className="max-w-2xl w-full">
        {qualities.map((quality, index) => (
          <motion.div 
            key={index}
            className="quality-item mb-10 opacity-0"
            initial={{ opacity: 0, y: 50 }}
            animate={observedElements.includes(index) ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 * index }}
          >
            <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${quality.color}`}>
              <h3 className="text-xl font-bold mb-3">{quality.title}</h3>
              <p className="text-neutral-dark/80 leading-relaxed">
                {quality.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
