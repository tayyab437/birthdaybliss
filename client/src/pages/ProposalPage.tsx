import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface VideoItem {
  id: number;
  url: string;
  title: string;
  caption: string;
}

function VideoPlayerCard({ video }: { video: VideoItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayToggle = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
          })
          .catch((err) => {
            console.warn("Direct play rejected by browser policy, attempting fallback:", err);
            vid.muted = true;
            vid.play()
              .then(() => {
                setIsPlaying(true);
                setHasStarted(true);
              })
              .catch((e2) => {
                console.error("Play failed:", e2);
              });
          });
      }
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-pink-200 flex flex-col group transition-all hover:shadow-2xl">
      <div className="relative w-full aspect-[9/16] max-h-[460px] bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef}
          src={video.url}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          controls={hasStarted}
          onPlay={() => {
            setIsPlaying(true);
            setHasStarted(true);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover"
        />

        {/* Center Play Button Overlay */}
        {!isPlaying && (
          <div 
            onClick={handlePlayToggle}
            className="absolute inset-0 flex items-center justify-center bg-black/35 z-20 cursor-pointer transition-opacity"
          >
            <motion.button
              type="button"
              onClick={handlePlayToggle}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Play Video"
              className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-2xl border-4 border-white backdrop-blur-md cursor-pointer transition-transform"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-10 h-10 md:w-12 md:h-12 ml-1.5 drop-shadow"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 text-left bg-gradient-to-b from-white to-pink-50/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full">
            Video {video.id}
          </span>
          <button
            type="button"
            onClick={handlePlayToggle}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-100/60 px-3 py-1 rounded-full flex items-center gap-1"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
        <h4 className="font-bold text-neutral-dark text-base md:text-lg">{video.title}</h4>
        <p className="text-xs md:text-sm text-gray-500 mt-1">{video.caption}</p>
      </div>
    </div>
  );
}

export default function ProposalPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [accepted, setAccepted] = useState(false);
  const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });
  const [noClickCount, setNoClickCount] = useState(0);

  const handleNoHover = () => {
    const randomX = (Math.random() - 0.5) * 220;
    const randomY = (Math.random() - 0.5) * 120;
    setNoBtnPosition({ x: randomX, y: randomY });
    setNoClickCount(prev => prev + 1);
  };

  const handleYesClick = () => {
    setAccepted(true);
    try {
      const sfx = new Audio('/confetti.mp3');
      sfx.volume = 0.8;
      sfx.play().catch(() => {});
    } catch {}
    toast({
      title: "SHE SAID YES! 💍💖",
      description: "My heart is overflowing with joy and love for you, Aqsa!",
    });
  };

  // 4 videos in requested sequence with direct mp4 URLs
  const videos: VideoItem[] = [
    {
      id: 1,
      title: "Our Special Moments ✨",
      url: "https://videotourl.com/videos/1792437439749-e1879eab-e3e3-4037-8822-0ac348987fb5.mp4",
      caption: "Cherishing every single second with you 💖"
    },
    {
      id: 2,
      title: "Pure Happiness & Smiles 🌸",
      url: "https://videotourl.com/videos/1792437416465-b60b8443-6e68-422d-9c51-488857237494.mp4",
      caption: "Your smile that brightens my entire universe 💕"
    },
    {
      id: 3,
      title: "Unforgettable Memories 💫",
      url: "https://videotourl.com/videos/1792437277186-dc77962f-8da7-4619-aa4d-a8a4853d8f54.mp4",
      caption: "Every single moment with you is an irreplaceable treasure 💍"
    },
    {
      id: 4,
      title: "Forever & Always 🌹",
      url: "https://videotourl.com/videos/1792437393524-908ee833-ac80-4661-b0b1-c8cbcfe13bb4.mp4",
      caption: "Looking forward to forever and always together with you 🥰"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-200 to-purple-200 flex flex-col items-center justify-center px-4 py-12 relative overflow-x-hidden">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/')}
          className="bg-white/80 hover:bg-white rounded-full shadow-md text-sm font-semibold"
        >
          ← Back to Birthday Site
        </Button>
      </div>

      {/* Floating background hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 50, 
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0.7 
            }}
            animate={{ 
              y: -50, 
              rotate: 360,
              opacity: [0.7, 1, 0] 
            }}
            transition={{ 
              duration: Math.random() * 4 + 3, 
              repeat: Infinity,
              delay: Math.random() * 2 
            }}
            className="absolute text-2xl md:text-3xl select-none"
          >
            {i % 2 === 0 ? '💖' : '🌹'}
          </motion.div>
        ))}
      </div>

      <div className="max-w-3xl w-full text-center relative z-10 bg-white/95 backdrop-blur-md p-6 md:p-12 rounded-3xl shadow-2xl border-4 border-pink-300 my-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-5xl md:text-7xl mb-4 animate-bounce">💍✨</div>
          <h1 className="cursive text-4xl md:text-7xl font-extrabold text-rose-600 mb-4 drop-shadow-md">
            Will You Marry Me?
          </h1>
          <p className="text-xl md:text-3xl font-bold text-neutral-dark mb-6 cursive">
            I love you so so much, Aqsa! 💖
          </p>
          <p className="text-sm md:text-base text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto">
            You are my greatest adventure, my safe haven, and the absolute love of my life. I want to spend all my tomorrows making you smile.
          </p>

          {!accepted ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYesClick}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xl rounded-full shadow-xl hover:shadow-2xl transition-all"
              >
                YES! A Million Times Yes! 💍🎉
              </motion.button>

              <motion.button
                onMouseEnter={handleNoHover}
                onClick={handleNoHover}
                animate={{ x: noBtnPosition.x, y: noBtnPosition.y }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 font-semibold text-lg rounded-full shadow-md hover:bg-gray-300 transition-all"
              >
                {noClickCount === 0 ? "No 🙈" : noClickCount < 3 ? "Are you sure? 🥺" : "You can't click this! 😄"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="my-8 p-6 bg-pink-50 rounded-2xl border-2 border-rose-300 shadow-inner"
            >
              <h2 className="cursive text-3xl md:text-4xl font-bold text-rose-600 mb-2">
                She Said YES! 🎉💍💖
              </h2>
              <p className="text-gray-700 font-medium">
                Our forever starts right here and now. I love you endlessly, Aqsa!
              </p>
            </motion.div>
          )}

          {/* Videos Section Beneath - Optimized for Mobile View with Center Play Buttons */}
          <div className="mt-12 border-t border-pink-200 pt-8">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-dark mb-2 cursive">
              Moments of Our Love 🎬
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mb-8">
              Tap any video or the play button to start watching
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {videos.map((vid) => (
                <VideoPlayerCard key={vid.id} video={vid} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
