import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageLoaderProps {
  delay?: number;
}

export default function PageLoader({ delay = 1500 }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-tr from-primary/30 to-secondary/30 backdrop-blur-sm"
        >
          <div className="mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-9xl"
            >
              🎂
            </motion.div>
          </div>
          
          <motion.h1 
            className="text-3xl font-bold mb-2 text-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading Aqsa's Birthday Site
          </motion.h1>
          
          <div className="relative w-64 h-2 bg-white/30 rounded-full overflow-hidden mt-4">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 left-0 h-full w-full bg-accent rounded-full"
            />
          </div>
          
          <motion.p 
            className="text-accent mt-4 cursive text-xl"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Preparing something special...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}