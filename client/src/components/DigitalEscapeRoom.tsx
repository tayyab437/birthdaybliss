import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DigitalEscapeRoomProps {
  onComplete?: () => void;
}

// Types for escape room puzzles
interface Puzzle {
  id: string;
  title: string;
  description: string;
  type: 'riddle' | 'code' | 'pattern';
  answer: string;
  hint: string;
  solved: boolean;
}

interface Room {
  id: string;
  name: string;
  description: string;
  puzzles: Puzzle[];
  unlocked: boolean;
  completed: boolean;
}

export default function DigitalEscapeRoom({ onComplete }: DigitalEscapeRoomProps) {
  const { toast } = useToast();
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Initialize rooms and puzzles
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: 'memory-room',
      name: 'Memory Room',
      description: 'Welcome to Aqsa\'s birthday memory lane. To unlock the next room, you need to solve puzzles related to her life.',
      unlocked: true,
      completed: false,
      puzzles: [
        {
          id: 'birthday-code',
          title: 'Birthday Code',
          description: 'Enter Aqsa\'s special birthday number code.',
          type: 'code',
          answer: '3', // Birthday code is 3
          hint: 'It\'s a small single-digit number, one of the first odd numbers.',
          solved: false
        },
        {
          id: 'favorite-color',
          title: 'Favorite Color',
          description: 'What\'s Aqsa\'s favorite color? (lowercase)',
          type: 'riddle',
          answer: 'black', // Favorite color is black
          hint: 'It\'s the absence of all colors, elegant and timeless.',
          solved: false
        }
      ]
    },
    {
      id: 'friendship-room',
      name: 'Friendship Room',
      description: 'Final room! These puzzles celebrate your connection with Aqsa and your memories together.',
      unlocked: false,
      completed: false,
      puzzles: [
        {
          id: 'friend-riddle',
          title: 'When Did You Meet?',
          description: 'In what year did you first meet Aqsa? (Enter the full year)',
          type: 'code',
          answer: '2022', // The year you met in Lahore
          hint: 'You met quite recently, in the 2020s.',
          solved: false
        },
        {
          id: 'shared-memory',
          title: 'Where Did You Meet?',
          description: 'In which city did you and Aqsa first meet? (lowercase)',
          type: 'riddle',
          answer: 'lahore', // The city where you met
          hint: 'It\'s a major cultural city in Pakistan.',
          solved: false
        },
        {
          id: 'lahore-memory',
          title: 'Lahore Memory',
          description: 'What was something special you both did in Lahore when you met? (hint: coffee, movie, or dinner)',
          type: 'riddle',
          answer: 'coffee', // Example - you can tell the user to change this
          hint: 'You might have enjoyed a hot beverage together.',
          solved: false
        },
        {
          id: 'friendship-year',
          title: 'Friendship Year',
          description: 'Enter the last two digits of the year you met in Lahore.',
          type: 'code',
          answer: '22', // Last two digits of 2022
          hint: 'It\'s from the year 2022.',
          solved: false
        }
      ]
    }
  ]);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setTimeElapsed(0);
    setHintsUsed(0);
    setCurrentRoomIndex(0);
    setCurrentPuzzleIndex(0);
    setShowHint(false);
    setShowSuccess(false);
    
    // Reset all room and puzzle states
    setRooms(rooms.map((room, index) => ({
      ...room,
      unlocked: index === 0, // Only first room is unlocked
      completed: false,
      puzzles: room.puzzles.map(puzzle => ({
        ...puzzle,
        solved: false
      }))
    })));
  };
  
  // Check answer
  const checkAnswer = () => {
    const room = rooms[currentRoomIndex];
    const puzzle = room.puzzles[currentPuzzleIndex];
    
    const userAnswer = currentInput.trim().toLowerCase();
    const correctAnswer = puzzle.answer.toLowerCase();
    
    if (userAnswer === correctAnswer) {
      // Correct answer
      playClickSound();
      
      // Mark puzzle as solved
      const updatedRooms = [...rooms];
      updatedRooms[currentRoomIndex].puzzles[currentPuzzleIndex].solved = true;
      
      // Check if all puzzles in room are solved
      const allPuzzlesSolved = updatedRooms[currentRoomIndex].puzzles.every(p => p.solved);
      
      if (allPuzzlesSolved) {
        // Mark room as completed
        updatedRooms[currentRoomIndex].completed = true;
        
        // Check if this is the last room
        if (currentRoomIndex === rooms.length - 1) {
          // Game completed
          setGameCompleted(true);
          setShowSuccess(true);
          playConfettiSound();
        } else {
          // Unlock next room
          updatedRooms[currentRoomIndex + 1].unlocked = true;
          
          toast({
            title: "Room Completed!",
            description: `You've unlocked the ${updatedRooms[currentRoomIndex + 1].name}!`,
          });
          
          // Move to next room
          setCurrentRoomIndex(currentRoomIndex + 1);
          setCurrentPuzzleIndex(0);
        }
      } else {
        // Move to next puzzle in current room
        setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        
        toast({
          title: "Correct!",
          description: "You solved the puzzle!",
        });
      }
      
      setRooms(updatedRooms);
      setCurrentInput('');
      setShowHint(false);
    } else {
      // Incorrect answer
      toast({
        title: "Incorrect",
        description: "That's not the right answer. Try again or use a hint.",
        variant: "destructive"
      });
    }
  };
  
  // Show hint
  const toggleHint = () => {
    if (!showHint) {
      setHintsUsed(hintsUsed + 1);
    }
    setShowHint(!showHint);
  };
  
  // Handle continue after completion
  const handleContinue = () => {
    setShowSuccess(false);
    if (onComplete) onComplete();
  };
  
  // Switch puzzle
  const switchPuzzle = (index: number) => {
    if (index >= 0 && index < rooms[currentRoomIndex].puzzles.length) {
      setCurrentPuzzleIndex(index);
      setCurrentInput('');
      setShowHint(false);
    }
  };
  
  // Switch room
  const switchRoom = (index: number) => {
    if (index >= 0 && index < rooms.length && rooms[index].unlocked) {
      setCurrentRoomIndex(index);
      setCurrentPuzzleIndex(0);
      setCurrentInput('');
      setShowHint(false);
    }
  };
  
  // Sound effects
  const playClickSound = () => {
    const clickSound = new Audio('/click.mp3');
    clickSound.volume = 0.3;
    clickSound.play().catch(() => {});
  };
  
  const playConfettiSound = () => {
    const confettiSound = new Audio('/confetti.mp3');
    confettiSound.volume = 0.5;
    confettiSound.play().catch(() => {});
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameStarted && !gameCompleted) {
      timer = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [gameStarted, gameCompleted]);
  
  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Current room and puzzle
  const currentRoom = rooms[currentRoomIndex];
  const currentPuzzle = currentRoom.puzzles[currentPuzzleIndex];
  
  return (
    <section 
      id="digital-escape-room" 
      className="section bg-gradient-to-tr from-secondary/20 to-primary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Birthday Escape Room</h2>
      <p className="cursive text-xl text-accent text-center mb-8">
        Solve the puzzles to unlock all the rooms!
      </p>
      
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 md:p-8">
        {!gameStarted && !gameCompleted && (
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Welcome to the Birthday Escape Room!</h3>
            <p className="mb-6">
              You're invited to a special challenge to celebrate Aqsa's birthday. Solve puzzles, unlock rooms, and discover birthday surprises along the way!
            </p>
            <Button 
              onClick={startGame}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg text-lg"
            >
              Start Adventure
            </Button>
          </div>
        )}
        
        {gameStarted && !gameCompleted && (
          <div>
            {/* Room navigation - Mobile Optimized */}
            <div className="mb-6 overflow-x-auto pb-2 ios-scroll-fix">
              <div className="flex gap-2 md:gap-3 min-w-max">
                {rooms.map((room, index) => (
                  <Button
                    key={room.id}
                    onClick={() => {
                      if (room.unlocked) {
                        switchRoom(index);
                        // Add haptic feedback for mobile
                        if (window.navigator && window.navigator.vibrate) {
                          window.navigator.vibrate(20);
                        }
                      }
                    }}
                    variant={currentRoomIndex === index ? "default" : "outline"}
                    className={`${currentRoomIndex === index ? 'bg-accent text-white' : ''} 
                                ${!room.unlocked ? 'opacity-50 cursor-not-allowed' : ''}
                                whitespace-nowrap touch-feedback h-12 md:h-10 mobile-shadow`}
                    disabled={!room.unlocked}
                  >
                    {room.unlocked ? room.name : (
                      <span className="flex items-center">
                        <span className="mr-1">🔒</span>
                        <span className="hidden md:inline">Locked Room</span>
                        <span className="md:hidden">Locked</span>
                      </span>
                    )}
                    {room.completed && <span className="ml-1 text-green-500">✓</span>}
                  </Button>
                ))}
              </div>
              <div className="mt-1 text-xs text-center text-gray-500 md:hidden">
                <p>Swipe to see all rooms</p>
              </div>
            </div>
            
            {/* Game stats */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <div>Time: {formatTime(timeElapsed)}</div>
              <div>Hints used: {hintsUsed}</div>
            </div>
            
            {/* Current room info */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">{currentRoom.name}</h3>
              <p className="mb-4 text-neutral-dark/70">{currentRoom.description}</p>
              
              {/* Puzzle tabs - Mobile Optimized */}
              <div className="flex mb-4 gap-2 overflow-x-auto pb-2 ios-scroll-fix">
                <div className="flex space-x-2 md:space-x-3 min-w-max">
                  {currentRoom.puzzles.map((puzzle, index) => (
                    <Button
                      key={puzzle.id}
                      onClick={() => {
                        switchPuzzle(index);
                        // Add haptic feedback for mobile
                        if (window.navigator && window.navigator.vibrate) {
                          window.navigator.vibrate(20);
                        }
                      }}
                      variant={currentPuzzleIndex === index ? "default" : "outline"}
                      className={`${currentPuzzleIndex === index ? 'bg-primary text-white' : ''} 
                                ${puzzle.solved ? 'border-green-500' : ''}
                                whitespace-nowrap touch-feedback h-12 md:h-10 mobile-shadow`}
                    >
                      <span className="hidden md:inline">{puzzle.title}</span>
                      <span className="md:hidden">{`Puzzle ${index + 1}`}</span>
                      {puzzle.solved && <span className="ml-1 text-green-500">✓</span>}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mt-1 mb-4 text-xs text-center text-gray-500 md:hidden">
                <p>Swipe to see more puzzles</p>
              </div>
            </div>
            
            {/* Current puzzle */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-bold mb-2">{currentPuzzle.title}</h4>
              <p className="mb-4">{currentPuzzle.description}</p>
              
              {showHint && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Hint:</strong> {currentPuzzle.hint}
                  </p>
                </div>
              )}
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  checkAnswer();
                }}
                className="flex flex-col md:flex-row gap-2"
              >
                <div className="relative w-full">
                  <Input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="Enter your answer..."
                    className="flex-1 h-12 md:h-10 pl-4 pr-10 text-lg"
                    disabled={currentPuzzle.solved}
                    autoCapitalize="off"
                  />
                  {currentInput.length > 0 && !currentPuzzle.solved && (
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 touch-feedback"
                      onClick={() => setCurrentInput('')}
                      aria-label="Clear input"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M15 9l-6 6" />
                        <path d="M9 9l6 6" />
                      </svg>
                    </button>
                  )}
                </div>
                <Button 
                  type="submit"
                  disabled={currentPuzzle.solved || !currentInput.trim()}
                  className={`${currentPuzzle.solved ? 'bg-green-500 text-white' : 'bg-primary text-white'} h-12 md:h-10 text-lg md:text-base touch-feedback`}
                >
                  {currentPuzzle.solved ? 'Solved!' : 'Submit'}
                </Button>
              </form>
            </div>
            
            {/* Controls - Mobile Optimized */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <Button
                onClick={toggleHint}
                variant="outline"
                disabled={currentPuzzle.solved}
                className="h-12 md:h-10 touch-feedback"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              
              <div className="flex gap-2 w-full md:w-auto">
                {currentPuzzleIndex > 0 && (
                  <Button
                    onClick={() => switchPuzzle(currentPuzzleIndex - 1)}
                    variant="outline"
                    className="flex-1 md:flex-initial h-12 md:h-10 touch-feedback"
                  >
                    <span className="hidden md:inline">Previous Puzzle</span>
                    <span className="md:hidden">Previous</span>
                  </Button>
                )}
                
                {currentPuzzleIndex < currentRoom.puzzles.length - 1 && (
                  <Button
                    onClick={() => switchPuzzle(currentPuzzleIndex + 1)}
                    variant="outline"
                    disabled={!currentRoom.puzzles[currentPuzzleIndex].solved}
                    className="flex-1 md:flex-initial h-12 md:h-10 touch-feedback"
                  >
                    <span className="hidden md:inline">Next Puzzle</span>
                    <span className="md:hidden">Next</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {gameCompleted && !showSuccess && (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-4">Escape Room Completed!</h3>
            <p className="mb-2">
              Congratulations! You've successfully solved all the puzzles and escaped!
            </p>
            <p className="mb-6">
              <span className="block md:inline">Time: {formatTime(timeElapsed)}</span> 
              <span className="hidden md:inline mx-2">|</span> 
              <span className="block md:inline">Hints used: {hintsUsed}</span>
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button
                onClick={startGame}
                variant="outline"
                className="h-12 md:h-10 touch-feedback mobile-shadow"
              >
                Play Again
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-accent text-white h-12 md:h-10 touch-feedback mobile-shadow"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
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
              className="bg-white rounded-xl p-6 md:p-8 mx-4 max-w-md text-center shadow-2xl"
            >
              <div className="text-5xl md:text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-3">Escape Room Master!</h3>
              <p className="mb-2">You've solved all the puzzles and completed the birthday escape room!</p>
              <p className="mb-6">
                <span className="block md:inline">Time: {formatTime(timeElapsed)}</span> 
                <span className="hidden md:inline mx-2">|</span> 
                <span className="block md:inline">Hints: {hintsUsed}</span>
              </p>
              <Button 
                onClick={handleContinue}
                className="px-6 py-4 md:py-3 bg-accent text-white rounded-full font-semibold hover:bg-opacity-90 transition-all touch-feedback h-14 md:h-12 text-lg"
              >
                Continue Celebrating
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confetti effect when completed */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="fixed inset-0 pointer-events-none overflow-hidden z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 100 }).map((_, i) => (
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
                  duration: Math.random() * 4 + 2,
                  ease: "linear"
                }}
                className="absolute w-4 h-4 text-lg"
                style={{
                  color: `hsl(${Math.random() * 360}, 100%, 70%)`,
                }}
              >
                {['🎊', '✨', '🎉', '🎁', '🎈', '🔐'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}