import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface WordScrambleGameProps {
  onGameComplete?: () => void;
}

// Birthday and celebration related words
const birthdayWords = [
  { word: "CELEBRATION", hint: "A special event to commemorate an occasion" },
  { word: "BIRTHDAY", hint: "Anniversary of the day someone was born" },
  { word: "PRESENTS", hint: "Gifts given to someone on a special occasion" },
  { word: "SURPRISE", hint: "Something unexpected that brings joy" },
  { word: "CANDLES", hint: "They're blown out after making a wish" },
  { word: "BALLOONS", hint: "Colorful inflated decorations" },
  { word: "HAPPINESS", hint: "Feeling of joy and contentment" },
  { word: "MEMORIES", hint: "Precious moments we remember" },
  { word: "FRIENDSHIP", hint: "A close relationship between people" },
  { word: "LAUGHTER", hint: "The sound of joy and amusement" },
  { word: "CONFETTI", hint: "Small pieces of colored paper thrown as celebration" },
  { word: "ZAINAB", hint: "The birthday star's name!" },
];

export default function WordScrambleGame({ onGameComplete }: WordScrambleGameProps) {
  const { toast } = useToast();
  const [currentWordObj, setCurrentWordObj] = useState<{ word: string; hint: string; scrambled: string }>({ 
    word: "", 
    hint: "", 
    scrambled: "" 
  });
  const [userGuess, setUserGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [wordsSolved, setWordsSolved] = useState<string[]>([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Function to scramble a word
  const scrambleWord = (word: string): string => {
    const wordArray = word.split('');
    for (let i = wordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    
    // Make sure the scrambled word is different from the original
    const scrambledWord = wordArray.join('');
    return scrambledWord === word ? scrambleWord(word) : scrambledWord;
  };
  
  // Select a new word that hasn't been solved yet
  const selectNewWord = () => {
    const availableWords = birthdayWords.filter(wordObj => 
      !wordsSolved.includes(wordObj.word)
    );
    
    if (availableWords.length === 0) {
      // All words completed
      endGame(true);
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWordObj = availableWords[randomIndex];
    const scrambledWord = scrambleWord(selectedWordObj.word);
    
    setCurrentWordObj({
      word: selectedWordObj.word,
      hint: selectedWordObj.hint,
      scrambled: scrambledWord
    });
  };
  
  // Start the game
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setWordsSolved([]);
    setShowSuccess(false);
    setGameCompleted(false);
    selectNewWord();
  };
  
  // End the game
  const endGame = (completed = false) => {
    setGameActive(false);
    setGameCompleted(completed);
    
    if (completed) {
      playConfettiSound();
      setShowSuccess(true);
    }
  };
  
  // Handle user guess submission
  const handleSubmitGuess = () => {
    if (!gameActive) return;
    
    const normalizedGuess = userGuess.trim().toUpperCase();
    const normalizedWord = currentWordObj.word.toUpperCase();
    
    if (normalizedGuess === normalizedWord) {
      // Correct guess
      const newScore = score + 10 * level;
      setScore(newScore);
      
      // Add to solved words
      setWordsSolved([...wordsSolved, currentWordObj.word]);
      
      // Increase level
      setLevel(level + 1);
      
      // Add some time as reward
      setTimeLeft(timeLeft + 10);
      
      // Show success toast
      toast({
        title: "Correct!",
        description: `Great job! +${10 * level} points. +10 seconds!`,
      });
      
      // Play sound
      playClickSound();
      
      // Move to next word
      selectNewWord();
      
      // Clear input
      setUserGuess('');
    } else {
      // Incorrect guess
      toast({
        title: "Try again!",
        description: "That's not the right word.",
        variant: "destructive"
      });
      
      // Reduce time as penalty
      setTimeLeft(Math.max(0, timeLeft - 5));
    }
  };
  
  // Get next letter hint
  const getHint = () => {
    if (!gameActive) return;
    
    const currentGuess = userGuess.toUpperCase();
    const targetWord = currentWordObj.word.toUpperCase();
    
    if (currentGuess.length >= targetWord.length) return;
    
    // Get the next letter as a hint
    const nextLetter = targetWord[currentGuess.length];
    setUserGuess(userGuess + nextLetter);
    
    // Small penalty for using hint
    setTimeLeft(Math.max(0, timeLeft - 3));
    
    toast({
      title: "Hint used",
      description: `-3 seconds. The next letter is '${nextLetter}'.`,
    });
  };
  
  // Handle skip word
  const skipWord = () => {
    if (!gameActive) return;
    
    // Penalty for skipping
    const newScore = Math.max(0, score - 5);
    setScore(newScore);
    
    toast({
      title: "Word skipped",
      description: `The word was '${currentWordObj.word}'. -5 points.`,
    });
    
    selectNewWord();
    setUserGuess('');
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
  
  // Handle continuing after completion
  const handleContinue = () => {
    setShowSuccess(false);
    if (onGameComplete) onGameComplete();
  };
  
  // Timer effect
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        endGame(false);
        toast({
          title: "Time's up!",
          description: `You scored ${score} points. Try again!`,
        });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft, gameActive, score, toast]);
  
  return (
    <section 
      id="word-scramble-game" 
      className="section bg-gradient-to-tr from-secondary/20 to-primary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Birthday Word Scramble</h2>
      <p className="cursive text-xl text-accent text-center mb-8">Unscramble the celebration words!</p>
      
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6 md:p-8">
        {!gameActive && !gameCompleted && (
          <div className="text-center">
            <p className="mb-6">
              Unscramble birthday-related words before the time runs out! 
              Each correct answer gives you points and extra time.
            </p>
            <Button 
              onClick={startGame}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg text-lg"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {!gameActive && gameCompleted && !showSuccess && (
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Amazing Job!</h3>
            <p className="mb-6">
              You've completed all the words with a score of {score} points!
            </p>
            <Button 
              onClick={startGame}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg text-lg"
            >
              Play Again
            </Button>
          </div>
        )}
        
        {gameActive && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm font-medium">Level: {level}</p>
                <p className="text-sm font-medium">Score: {score}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Time Left:</p>
                <p className={`text-xl font-bold ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                  {timeLeft}s
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Unscramble this word:</h3>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {currentWordObj.scrambled.split('').map((letter, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="w-10 h-10 bg-secondary/10 rounded-md flex items-center justify-center text-lg font-bold"
                  >
                    {letter}
                  </motion.div>
                ))}
              </div>
              
              <p className="text-center mb-4 text-sm text-neutral-dark/70">
                <strong>Hint:</strong> {currentWordObj.hint}
              </p>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitGuess();
                }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="Type your answer..."
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" className="bg-primary text-white">
                  Check
                </Button>
              </form>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button 
                onClick={getHint}
                variant="outline"
                className="flex-1"
              >
                Get Hint (-3s)
              </Button>
              <Button
                onClick={skipWord}
                variant="outline"
                className="flex-1"
              >
                Skip Word (-5 pts)
              </Button>
            </div>
            
            {wordsSolved.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium mb-2">Words solved: {wordsSolved.length}/{birthdayWords.length}</p>
                <div className="flex flex-wrap gap-2">
                  {wordsSolved.map((word, index) => (
                    <span key={index} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Success Message */}
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
            className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-3">Word Master!</h3>
            <p className="mb-2">You've unscrambled all the words!</p>
            <p className="mb-6">Final Score: {score} points</p>
            <Button 
              onClick={handleContinue}
              className="px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-opacity-90 transition-all"
            >
              Continue Celebrating
            </Button>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}