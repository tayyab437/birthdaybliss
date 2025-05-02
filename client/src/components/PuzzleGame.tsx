import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PuzzlePiece {
  id: number;
  currentPosition: number;
  correctPosition: number;
  image: string;
}

interface PuzzleGameProps {
  onPuzzleComplete: () => void;
}

export default function PuzzleGame({ onPuzzleComplete }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  
  const puzzleImageUrl = "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80";
  const pieceCount = 9; // 3x3 grid
  
  // Initialize puzzle
  useEffect(() => {
    initializePuzzle();
  }, []);
  
  // Initialize puzzle pieces
  const initializePuzzle = () => {
    const initialPieces: PuzzlePiece[] = Array.from({ length: pieceCount }, (_, index) => ({
      id: index,
      correctPosition: index,
      currentPosition: index,
      image: puzzleImageUrl
    }));
    
    // Shuffle pieces
    const shuffledPieces = [...initialPieces].sort(() => Math.random() - 0.5);
    
    // Update current positions after shuffle
    shuffledPieces.forEach((piece, index) => {
      piece.currentPosition = index;
    });
    
    setPieces(shuffledPieces);
    updateProgress(shuffledPieces);
  };
  
  // Update progress
  const updateProgress = (currentPieces: PuzzlePiece[]) => {
    const correctPieces = currentPieces.filter(piece => piece.currentPosition === piece.correctPosition);
    const newProgress = Math.floor((correctPieces.length / pieceCount) * 100);
    setProgress(newProgress);
    
    // Check if puzzle is completed
    if (newProgress === 100 && !puzzleCompleted) {
      setPuzzleCompleted(true);
      setTimeout(() => {
        setShowSuccess(true);
        playConfettiSound();
      }, 500);
    }
  };
  
  // Handle drag start
  const handleDragStart = (pieceId: number) => {
    setDraggedPiece(pieceId);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDropTarget(position);
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, dropPosition: number) => {
    e.preventDefault();
    
    if (draggedPiece === null) return;
    
    const newPieces = [...pieces];
    const draggedIndex = newPieces.findIndex(p => p.id === draggedPiece);
    const dropIndex = newPieces.findIndex(p => p.currentPosition === dropPosition);
    
    // Swap positions
    const temp = newPieces[draggedIndex].currentPosition;
    newPieces[draggedIndex].currentPosition = newPieces[dropIndex].currentPosition;
    newPieces[dropIndex].currentPosition = temp;
    
    setPieces(newPieces);
    updateProgress(newPieces);
    playClickSound();
    
    // Reset drag state
    setDraggedPiece(null);
    setDropTarget(null);
  };
  
  // Reset puzzle
  const resetPuzzle = () => {
    initializePuzzle();
    setPuzzleCompleted(false);
    playClickSound();
  };
  
  // Toggle hint
  const toggleHint = () => {
    setShowHint(!showHint);
    playClickSound();
  };
  
  // Close success message and navigate to next section
  const handleContinue = () => {
    setShowSuccess(false);
    onPuzzleComplete();
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
  
  return (
    <section 
      id="puzzle-game" 
      className="section bg-gradient-to-tr from-secondary/20 to-primary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-6 font-bold">Birthday Puzzle</h2>
      <p className="text-center mb-8 max-w-lg">Solve this special puzzle by dragging and arranging the pieces in the correct order.</p>
      
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-6 mb-8">
        {/* Puzzle Board */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-secondary mb-4">
          {/* Hint Image */}
          {showHint && (
            <img 
              src={puzzleImageUrl} 
              alt="Birthday cake with candles" 
              className="w-full h-full object-cover" 
            />
          )}
          
          {/* Puzzle pieces container */}
          {!showHint && (
            <div className="grid grid-cols-3 gap-1 absolute inset-0">
              {Array.from({ length: pieceCount }).map((_, position) => {
                const piece = pieces.find(p => p.currentPosition === position);
                return (
                  <div 
                    key={position}
                    className={`relative aspect-square ${dropTarget === position ? 'bg-accent/20' : ''}`}
                    onDragOver={(e) => handleDragOver(e, position)}
                    onDrop={(e) => handleDrop(e, position)}
                  >
                    {piece && (
                      <div
                        draggable
                        onDragStart={() => handleDragStart(piece.id)}
                        className={`puzzle-piece w-full h-full ${piece.currentPosition === piece.correctPosition ? 'correct' : ''}`}
                      >
                        <div 
                          className="w-full h-full bg-cover bg-no-repeat" 
                          style={{
                            backgroundImage: `url(${piece.image})`,
                            backgroundPosition: `${(piece.correctPosition % 3) * 50}% ${Math.floor(piece.correctPosition / 3) * 50}%`,
                            backgroundSize: '300%',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Puzzle Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex-1">
            <p className="text-sm mb-1">Progress:</p>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="progress-bar-fill h-full bg-accent rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={toggleHint}
              className="px-4 py-2 bg-secondary text-white rounded-lg text-sm"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            <button 
              onClick={resetPuzzle}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {/* Puzzle Instructions */}
      <div className="max-w-md text-center text-sm text-neutral-dark/70">
        <p>Drag and drop the puzzle pieces to complete the image. When all pieces are in their correct positions, you'll get a special surprise!</p>
      </div>
      
      {/* Success Message */}
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
              className="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-3">Amazing Job!</h3>
              <p className="mb-6">You've completed the birthday puzzle!</p>
              <button 
                onClick={handleContinue}
                className="px-6 py-3 bg-accent text-white rounded-full font-semibold hover:bg-opacity-90 transition-all"
              >
                Continue Celebrating
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
