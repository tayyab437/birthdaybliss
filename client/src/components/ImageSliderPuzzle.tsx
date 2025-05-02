import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageSliderPuzzleProps {
  onPuzzleComplete?: () => void;
}

// Puzzle tile for the slider puzzle
interface PuzzleTile {
  id: number;
  currentPosition: number;
  correctPosition: number;
}

// Directions for sliding tiles
type Direction = 'up' | 'down' | 'left' | 'right' | null;

export default function ImageSliderPuzzle({ onPuzzleComplete }: ImageSliderPuzzleProps) {
  const { toast } = useToast();
  const [tiles, setTiles] = useState<PuzzleTile[]>([]);
  const [emptyPosition, setEmptyPosition] = useState<number>(15); // Last position is empty by default
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [difficulty, setDifficulty] = useState<'medium' | 'hard'>('medium');
  const [puzzleSize, setPuzzleSize] = useState<4 | 5>(4); // Default 4x4 grid
  const [puzzleImage, setPuzzleImage] = useState("https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80");
  const [showHint, setShowHint] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Initialize the puzzle
  const initializePuzzle = () => {
    // Determine grid size based on difficulty
    const gridSize = difficulty === 'hard' ? 5 : 4;
    setPuzzleSize(gridSize as 4 | 5);
    
    const totalTiles = gridSize * gridSize;
    
    // Create tiles
    let initialTiles: PuzzleTile[] = Array.from({ length: totalTiles - 1 }, (_, index) => ({
      id: index,
      correctPosition: index,
      currentPosition: index
    }));
    
    // Shuffle tiles (ensure puzzle is solvable)
    let shuffledTiles = createSolvablePuzzle([...initialTiles], gridSize);
    
    // Set the last position as empty
    const lastPosition = totalTiles - 1;
    setEmptyPosition(lastPosition);
    
    setTiles(shuffledTiles);
    setMoves(0);
    setTimeElapsed(0);
    setIsGameActive(true);
    setIsSuccess(false);
  };
  
  // Create a solvable puzzle (important for slider puzzles)
  const createSolvablePuzzle = (tiles: PuzzleTile[], size: number): PuzzleTile[] => {
    // For a slider puzzle to be solvable:
    // For odd grid width: the number of inversions must be even
    // For even grid width: the number of inversions + row of empty space from bottom must be odd
    
    // Shuffle first
    let shuffled = [...tiles].sort(() => Math.random() - 0.5);
    
    // Calculate inversions
    const countInversions = (arr: PuzzleTile[]): number => {
      let inversions = 0;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].id > arr[j].id && arr[i].currentPosition < arr[j].currentPosition) {
            inversions++;
          }
        }
      }
      return inversions;
    };
    
    // Assign new current positions
    shuffled = shuffled.map((tile, index) => ({ ...tile, currentPosition: index }));
    
    // Check if solvable
    const inversions = countInversions(shuffled);
    const isEvenGridWidth = size % 2 === 0;
    const emptyRowFromBottom = Math.floor((size * size - 1) / size) + 1;
    
    const isSolvable = isEvenGridWidth 
      ? (inversions + emptyRowFromBottom) % 2 === 1
      : inversions % 2 === 0;
    
    // If not solvable, swap the first two tiles to change parity
    if (!isSolvable && shuffled.length >= 2) {
      const temp = shuffled[0].currentPosition;
      shuffled[0].currentPosition = shuffled[1].currentPosition;
      shuffled[1].currentPosition = temp;
    }
    
    return shuffled;
  };
  
  // Check if a tile can be moved into the empty position
  const canMoveTile = (tilePosition: number): Direction => {
    const size = puzzleSize;
    
    // Check if the tile is adjacent to the empty space
    // Calculate row and column for tile and empty space
    const tileRow = Math.floor(tilePosition / size);
    const tileCol = tilePosition % size;
    const emptyRow = Math.floor(emptyPosition / size);
    const emptyCol = emptyPosition % size;
    
    // Check if they're in the same row and adjacent columns
    if (tileRow === emptyRow && Math.abs(tileCol - emptyCol) === 1) {
      return tileCol > emptyCol ? 'left' : 'right';
    }
    
    // Check if they're in the same column and adjacent rows
    if (tileCol === emptyCol && Math.abs(tileRow - emptyRow) === 1) {
      return tileRow > emptyRow ? 'up' : 'down';
    }
    
    return null;
  };
  
  // Handle tile click
  const handleTileClick = (tilePosition: number) => {
    if (!isGameActive) return;
    
    const direction = canMoveTile(tilePosition);
    if (!direction) return;
    
    // Move the tile
    const newTiles = [...tiles];
    const tileIndex = newTiles.findIndex(t => t.currentPosition === tilePosition);
    
    if (tileIndex !== -1) {
      newTiles[tileIndex].currentPosition = emptyPosition;
      setEmptyPosition(tilePosition);
      setTiles(newTiles);
      setMoves(moves + 1);
      playClickSound();
      
      // Check if puzzle is solved
      checkPuzzleCompletion(newTiles);
    }
  };
  
  // Check if the puzzle is completed
  const checkPuzzleCompletion = (currentTiles: PuzzleTile[]) => {
    const allCorrect = currentTiles.every(tile => tile.currentPosition === tile.correctPosition);
    
    if (allCorrect) {
      setIsGameActive(false);
      setIsSuccess(true);
      toast({
        title: "Puzzle Completed!",
        description: `You solved it in ${moves + 1} moves and ${formatTime(timeElapsed)}!`,
      });
      playConfettiSound();
    }
  };
  
  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
  
  // Handle continue after completion
  const handleContinue = () => {
    if (onPuzzleComplete) onPuzzleComplete();
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGameActive) {
      timer = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }
    
    return () => clearInterval(timer);
  }, [isGameActive]);
  
  // Calculate styles for a tile
  const getTileStyle = (tile: PuzzleTile) => {
    const size = puzzleSize;
    
    // For grid placement
    const row = Math.floor(tile.currentPosition / size);
    const col = tile.currentPosition % size;
    
    // For background image positioning
    const correctRow = Math.floor(tile.correctPosition / size);
    const correctCol = tile.correctPosition % size;
    
    return {
      gridRow: `${row + 1} / span 1`,
      gridColumn: `${col + 1} / span 1`,
      backgroundImage: `url(${puzzleImage})`,
      backgroundSize: `${size * 100}%`,
      backgroundPosition: `${correctCol * 100 / (size - 1)}% ${correctRow * 100 / (size - 1)}%`,
    };
  };
  
  return (
    <section 
      id="image-slider-puzzle" 
      className="section bg-gradient-to-bl from-primary/20 to-secondary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Slider Puzzle Challenge</h2>
      <p className="cursive text-xl text-accent text-center mb-8">Slide tiles to complete the image</p>
      
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-6 md:p-8">
        {!isGameActive && !isSuccess && (
          <div className="text-center">
            <p className="mb-6">
              Slide the tiles to recreate the image. The harder the difficulty,
              the more tiles you'll need to arrange!
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Select Difficulty:</h3>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setDifficulty('medium')}
                  variant={difficulty === 'medium' ? 'default' : 'outline'}
                  className={difficulty === 'medium' ? 'bg-accent text-white' : ''}
                >
                  Medium (4×4)
                </Button>
                <Button
                  onClick={() => setDifficulty('hard')}
                  variant={difficulty === 'hard' ? 'default' : 'outline'}
                  className={difficulty === 'hard' ? 'bg-accent text-white' : ''}
                >
                  Hard (5×5)
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={initializePuzzle}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-lg text-lg"
            >
              Start Puzzle
            </Button>
          </div>
        )}
        
        {isGameActive && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm font-medium">Moves: {moves}</p>
                <p className="text-sm font-medium">Time: {formatTime(timeElapsed)}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowHint(!showHint)}
                  variant="outline"
                  size="sm"
                >
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </Button>
                <Button 
                  onClick={initializePuzzle}
                  variant="outline"
                  size="sm"
                >
                  Reset
                </Button>
              </div>
            </div>
            
            {/* Hint Image */}
            {showHint && (
              <div className="mb-4">
                <div className="aspect-square max-w-[200px] mx-auto rounded overflow-hidden border-2 border-accent">
                  <img 
                    src={puzzleImage}
                    alt="Complete puzzle image" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm mt-2 text-neutral-dark/70">
                  Reference image
                </p>
              </div>
            )}
            
            {/* Puzzle Grid */}
            <div 
              className={`aspect-square w-full mx-auto border-2 border-secondary rounded-lg overflow-hidden
                grid gap-[2px] bg-gray-800
                ${puzzleSize === 4 ? 'grid-cols-4 grid-rows-4' : 'grid-cols-5 grid-rows-5'}`}
            >
              {tiles.map((tile) => (
                <motion.div
                  key={tile.id}
                  className="relative bg-cover cursor-pointer hover:brightness-110 transition-all"
                  style={getTileStyle(tile)}
                  layoutId={`tile-${tile.id}`}
                  onClick={() => handleTileClick(tile.currentPosition)}
                  whileHover={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-lg">
                    {difficulty === 'hard' ? null : tile.id + 1}
                  </div>
                </motion.div>
              ))}
              
              {/* Empty space */}
              <div 
                className="bg-gray-800"
                style={{
                  gridRow: `${Math.floor(emptyPosition / puzzleSize) + 1} / span 1`,
                  gridColumn: `${emptyPosition % puzzleSize + 1} / span 1`,
                }}
              />
            </div>
            
            <p className="text-center mt-4 text-sm text-neutral-dark/70">
              Click on tiles adjacent to the empty space to slide them.
            </p>
          </div>
        )}
        
        {isSuccess && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-3">Puzzle Solved!</h3>
            <p className="mb-2">Congratulations! You completed the puzzle.</p>
            <p className="mb-6">
              Moves: {moves} | Time: {formatTime(timeElapsed)}
            </p>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={initializePuzzle}
                variant="outline"
              >
                Play Again
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-accent text-white"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Success Animation */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div 
            className="fixed inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
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
                {['🎊', '✨', '🎉', '🎁', '🎈'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}