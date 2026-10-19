import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function BirthdayCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    // Set target birthday date to October 21st
    const getTargetDate = () => {
      const now = new Date();
      // Month 9 is October (0-indexed: Jan=0, Oct=9), day 21 at 00:00:00
      let target = new Date(now.getFullYear(), 9, 21, 0, 0, 0);
      if (now.getTime() > target.getTime()) {
        target = new Date(now.getFullYear() + 1, 9, 21, 0, 0, 0);
      }
      return target;
    };
    
    const updateCountdown = () => {
      const target = getTargetDate();
      const now = new Date();
      const difference = target.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculate immediately so no delay
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Animation variants for counting numbers
  const countVariants = {
    animate: {
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <section 
      id="birthday-countdown" 
      className="section bg-gradient-to-tr from-secondary/20 to-primary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Time Until Next Birthday</h2>
      <p className="cursive text-xl text-accent text-center mb-12">Counting down to Aqsa's Birthday on October 21st</p>
      
      <div className="countdown-container max-w-2xl w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Days */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 text-center"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-4xl font-bold text-accent"
              key={timeLeft.days}
              variants={countVariants}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {timeLeft.days}
            </motion.div>
            <div className="text-sm uppercase tracking-wider mt-2 font-medium text-gray-500">Days</div>
          </motion.div>
          
          {/* Hours */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 text-center"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-4xl font-bold text-rose-600"
              key={timeLeft.hours}
              variants={countVariants}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {timeLeft.hours}
            </motion.div>
            <div className="text-sm uppercase tracking-wider mt-2 font-medium text-gray-500">Hours</div>
          </motion.div>
          
          {/* Minutes */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 text-center"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-4xl font-bold text-purple-600"
              key={timeLeft.minutes}
              variants={countVariants}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {timeLeft.minutes}
            </motion.div>
            <div className="text-sm uppercase tracking-wider mt-2 font-medium text-gray-500">Minutes</div>
          </motion.div>
          
          {/* Seconds */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 text-center"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div 
              className="text-4xl font-bold text-accent"
              key={timeLeft.seconds}
              variants={countVariants}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {timeLeft.seconds}
            </motion.div>
            <div className="text-sm uppercase tracking-wider mt-2 font-medium text-gray-500">Seconds</div>
          </motion.div>
        </div>
        
        <div className="text-center mt-8 text-sm text-neutral-dark/70 font-medium">
          <p>Get ready for Aqsa's big celebration on October 21st! 🎂🎉</p>
        </div>
      </div>
    </section>
  );
}
