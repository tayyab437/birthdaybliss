import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ImageSliderProps {
  onComplete?: () => void;
}

export default function ImageSlider({ onComplete }: ImageSliderProps) {
  // Beautiful images with "Happy Birthday Aqsa Zulfiqar" and wishes
  const [images, setImages] = useState<Array<{ url: string; title: string; caption: string }>>([
    {
      url: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1000&h=700&fit=crop",
      title: "Happy Birthday Aqsa Zulfiqar",
      caption: "May your year be filled with boundless joy, laughter, and sweet success! 🎂✨"
    },
    {
      url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000&h=700&fit=crop",
      title: "Happy Birthday Aqsa Zulfiqar",
      caption: "Wishing you a celebration day as radiant, beautiful, and wonderful as your smile! 🎈💖"
    },
    {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&h=700&fit=crop",
      title: "Happy Birthday Aqsa Zulfiqar",
      caption: "Here's to making gorgeous memories and celebrating the amazing person you are! 🌟"
    },
    {
      url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1000&h=700&fit=crop",
      title: "Happy Birthday Aqsa Zulfiqar",
      caption: "May all your dreams, goals, and heartfelt wishes come true this year! 🥂🎉"
    },
    {
      url: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1000&h=700&fit=crop",
      title: "Happy Birthday Aqsa Zulfiqar",
      caption: "Sending you endless love, warm hugs, and the happiest birthday greetings! 🎁🌸"
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [customLinkInput, setCustomLinkInput] = useState('');
  const [customCaptionInput, setCustomCaptionInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, images.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLinkInput.trim()) return;

    setImages(prev => [
      ...prev,
      {
        url: customLinkInput.trim(),
        title: "Happy Birthday Aqsa Zulfiqar",
        caption: customCaptionInput.trim() || "Wishing you all the happiness in the world! 💖"
      }
    ]);
    setCustomLinkInput('');
    setCustomCaptionInput('');
    setShowAddForm(false);
  };

  return (
    <section 
      id="image-slider" 
      className="section bg-gradient-to-tr from-primary/10 via-pink-50 to-secondary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <div className="max-w-4xl w-full text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-dark mb-2">Aqsa's Memory Gallery</h2>
        <p className="cursive text-xl text-accent mb-8">Precious moments & celebration snapshots</p>

        {/* Main Slider Display */}
        <div 
          className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-black/10 group border-4 border-white"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={images[currentIndex].url} 
                alt={images[currentIndex].title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=600&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10 text-left">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <span className="inline-block bg-rose-600/90 text-white text-xs md:text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 shadow-md">
                    🎉 Special Birthday Memory
                  </span>
                  <h3 className="cursive text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
                    {images[currentIndex].title}
                  </h3>
                  <p className="text-white/90 text-sm md:text-lg font-medium drop-shadow-md max-w-2xl leading-relaxed">
                    {images[currentIndex].caption}
                  </p>
                </motion.div>
                <span className="absolute top-4 right-4 bg-black/50 text-white/90 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-neutral-dark flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 font-bold text-lg"
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 hover:bg-white text-neutral-dark flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 font-bold text-lg"
            aria-label="Next slide"
          >
            ❯
          </button>


        </div>


      </div>
    </section>
  );
}
