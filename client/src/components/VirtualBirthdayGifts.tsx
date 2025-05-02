import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Gift {
  id: number;
  name: string;
  description: string;
  emoji: string;
  image: string;
  isOpened: boolean;
}

export default function VirtualBirthdayGifts() {
  const { toast } = useToast();
  
  // Gift collection
  const [gifts, setGifts] = useState<Gift[]>([
    {
      id: 1,
      name: "Memory Book",
      description: "A digital collection of our favorite memories together through photos and stories.",
      emoji: "📔",
      image: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isOpened: false
    },
    {
      id: 2,
      name: "Playlist of Joy",
      description: "A curated playlist of songs that remind me of you and our friendship.",
      emoji: "🎵",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isOpened: false
    },
    {
      id: 3,
      name: "Virtual Spa Day",
      description: "A reminder to take a day for yourself - with links to relaxing music and self-care ideas.",
      emoji: "💆‍♀️",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isOpened: false
    },
    {
      id: 4,
      name: "Adventure Voucher",
      description: "An IOU for our next adventure together - you choose the destination!",
      emoji: "🧭",
      image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isOpened: false
    },
    {
      id: 5,
      name: "Birthday Poem",
      description: "A special poem written just for you on your birthday.",
      emoji: "📝",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isOpened: false
    }
  ]);
  
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isUnwrapping, setIsUnwrapping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Handle gift selection
  const selectGift = (gift: Gift) => {
    if (gift.isOpened) {
      // If already opened, just show it
      setSelectedGift(gift);
      setShowModal(true);
    } else {
      // If not opened, start unwrapping animation
      setSelectedGift(gift);
      setIsUnwrapping(true);
      
      // After animation, mark as opened
      setTimeout(() => {
        setGifts(gifts.map(g => 
          g.id === gift.id ? { ...g, isOpened: true } : g
        ));
        
        setIsUnwrapping(false);
        setShowModal(true);
        playConfettiSound();
        
        toast({
          title: "Gift Unwrapped!",
          description: `You've opened: ${gift.name}`,
        });
      }, 2000);
    }
  };
  
  // Check if all gifts are opened
  const allGiftsOpened = gifts.every(gift => gift.isOpened);
  
  // Sound effects
  const playConfettiSound = () => {
    const confettiSound = new Audio('/confetti.mp3');
    confettiSound.volume = 0.5;
    confettiSound.play().catch(() => {});
  };
  
  // Reset all gifts (for testing)
  const resetGifts = () => {
    setGifts(gifts.map(gift => ({ ...gift, isOpened: false })));
    toast({
      title: "Gifts Reset",
      description: "All gifts are wrapped and ready to be opened again!",
    });
  };
  
  return (
    <section 
      id="virtual-gifts" 
      className="section bg-gradient-to-tr from-secondary/20 to-primary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Virtual Birthday Gifts</h2>
      <p className="cursive text-xl text-accent text-center mb-8">Unwrap special surprises!</p>
      
      <div className="max-w-4xl w-full">
        {/* Grid of gifts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map(gift => (
            <motion.div
              key={gift.id}
              className={`relative cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all
                        ${gift.isOpened ? 'bg-white' : 'bg-accent/20'}
                        hover:shadow-xl hover:-translate-y-1`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectGift(gift)}
            >
              <div className="aspect-square relative">
                {/* Gift wrapper overlay (hidden when opened) */}
                {!gift.isOpened && (
                  <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary p-4 flex flex-col items-center justify-center text-white">
                    <div className="text-6xl mb-4">{gift.emoji}</div>
                    <div className="text-xl font-bold text-center">Tap to Unwrap!</div>
                    <div className="absolute inset-0 pointer-events-none">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-white opacity-10 rounded-full"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${Math.random() * 5 + 5}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Gift image (shown when opened) */}
                <img
                  src={gift.image}
                  alt={gift.name}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${gift.isOpened ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* Badge for opened gifts */}
                {gift.isOpened && (
                  <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full">
                    Opened
                  </div>
                )}
              </div>
              
              {/* Gift title (visible after opening) */}
              {gift.isOpened && (
                <div className="p-4 bg-white">
                  <h3 className="text-lg font-bold truncate">{gift.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{gift.description}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        {/* Gift status */}
        <div className="mt-8 text-center">
          <p className="mb-4">
            {allGiftsOpened 
              ? "You've unwrapped all your virtual gifts!" 
              : `You've opened ${gifts.filter(g => g.isOpened).length} of ${gifts.length} gifts!`}
          </p>
          
          {allGiftsOpened && (
            <Button
              onClick={resetGifts}
              variant="outline"
              className="bg-white"
            >
              Wrap Gifts Again
            </Button>
          )}
        </div>
      </div>
      
      {/* Unwrapping Animation Modal */}
      <AnimatePresence>
        {isUnwrapping && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring" }}
              className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl"
            >
              <div className="text-6xl mb-4 animate-bounce">{selectedGift.emoji}</div>
              <h3 className="text-2xl font-bold mb-6">Unwrapping your gift...</h3>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-accent"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gift Details Modal */}
      <AnimatePresence>
        {showModal && selectedGift && !isUnwrapping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring" }}
              className="bg-white rounded-xl overflow-hidden max-w-md w-full shadow-2xl"
            >
              <div className="relative aspect-video">
                <img
                  src={selectedGift.image}
                  alt={selectedGift.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-4xl mr-3">{selectedGift.emoji}</div>
                  <h3 className="text-2xl font-bold">{selectedGift.name}</h3>
                </div>
                <p className="text-gray-700 mb-6">{selectedGift.description}</p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowModal(false)}
                    className="bg-accent text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confetti for first time opening all gifts */}
      <AnimatePresence>
        {allGiftsOpened && gifts.some(g => g.isOpened) && (
          <motion.div 
            className="fixed inset-0 pointer-events-none overflow-hidden z-40"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
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
                {['🎁', '🎊', '✨', '🎉', '🎈'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}