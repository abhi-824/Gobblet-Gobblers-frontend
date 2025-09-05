
  // Result dialog
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
interface ResultDialogProps{
  result: "win" | "lose" | "draw" | null;
  setResult: (result: "win" | "lose" | "draw" | null) => void;
  setShowPlayAgainButton: (show: boolean) => void;
  winner?: { id: string; type: "human" | "computer"; name?: string } | null;
}
export function ResultDialog({result, setResult, setShowPlayAgainButton, winner}: ResultDialogProps) {
    if (!result) return null;
  const navigate = useNavigate();
    
    const handleClose = () => {
      setResult(null);
      setShowPlayAgainButton(true);
    };

    const handlePlayAgain = () => {
      navigate("/")
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    return createPortal(
      <motion.div 
        className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/60 z-50"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <motion.div 
          className="bg-white text-black p-8 rounded-3xl shadow-2xl text-center w-80 max-w-[90vw] relative"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Result Content */}
          <div className="mb-6">
            <motion.div
              className="text-6xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {result === "win" && "🎉"}
              {result === "lose" && "😢"}
              {result === "draw" && "🤝"}
            </motion.div>
            
            <motion.h2 
              className="text-3xl font-bold mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {result === "win" && "You Win!"}
              {result === "lose" && "You Lose!"}
              {result === "draw" && "It's a Draw!"}
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 text-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {result === "win" && "Congratulations! You've conquered the cosmic battlefield!"}
              {result === "lose" && winner?.type === "computer" && "The AI has outsmarted you this time! Better luck next time!"}
              {result === "lose" && winner?.type === "human" && "The other player has won! Better luck next time!"}
              {result === "lose" && !winner && "Better luck next time! The robots got the upper hand."}
              {result === "draw" && "An epic battle with no clear winner! Ready for a rematch?"}
            </motion.p>
          </div>

          {/* Play Again Button */}
          <motion.button
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={handlePlayAgain}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 Play Again
          </motion.button>
        </motion.div>
      </motion.div>,
      document.body
    );
  }