import React from "react";
import { motion } from "framer-motion";

// Game Start Loader
export const GameStartLoader: React.FC = () => {
  return (
    <div className="min-h-screen min-w-screen fixed inset-0 flex items-center justify-center bg-[#0D013D]/95 backdrop-blur-sm z-50">
      <div className="text-center">
        <motion.div
          className="mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-4 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#B57BFE] border-r-[#7ED957]"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#3EC1D3] border-b-[#F97B5B]"></div>
            <div className="absolute inset-4 rounded-full border-4 border-transparent border-l-[#FFD93D] border-r-[#B57BFE]"></div>
          </motion.div>
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-white mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          🚀 Launching Battle Arena
        </motion.h2>
        
        <motion.p
          className="text-[#B57BFE] text-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Preparing your cosmic showdown...
        </motion.p>
        
        <motion.div
          className="mt-6 flex justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#B57BFE] rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// Move Loading Overlay
export const MoveLoader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.div
      className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-[#0D013D]/90 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-[#B57BFE]/50 shadow-lg z-40"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-transparent border-t-[#B57BFE] border-r-[#7ED957]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-sm font-medium">{message}</span>
      </div>
    </motion.div>
  );
};

// Opponent Move Loader
export const OpponentMoveLoader: React.FC = () => {
  return (
    <motion.div
      className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-[#0D013D]/90 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-[#3EC1D3]/50 shadow-lg"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center space-x-3">
        <motion.div
          className="w-5 h-5 rounded-full border-2 border-transparent border-t-[#3EC1D3]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="text-sm font-medium">🤖 Robot is thinking...</span>
      </div>
    </motion.div>
  );
};

// Piece Animation Loader
export const PieceAnimationLoader: React.FC<{ 
  pieceType: "alien" | "robot"; 
  size: "lg" | "md" | "sm";
  position: { x: number; y: number };
}> = ({ pieceType, size, position }) => {
  const sizeMap = { lg: 120, md: 90, sm: 60 };
  const dimension = sizeMap[size];
  
  return (
    <motion.div
      className="absolute pointer-events-none z-30"
      style={{
        left: position.x - dimension / 2,
        top: position.y - (dimension * 1.2) / 2,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1],
        y: [20, -10, 0]
      }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {pieceType === "alien" ? (
          <svg width={dimension} height={dimension * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="110" rx="32" ry="10" fill="#463A6E"/>
            <ellipse cx="50" cy="60" rx="40" ry="50" fill="#7ED957" stroke="#333" strokeWidth="4"/>
            <ellipse cx="50" cy="60" rx="30" ry="40" fill="#7ED957"/>
            <ellipse cx="50" cy="60" rx="18" ry="18" fill="#fff"/>
            <ellipse cx="50" cy="60" rx="8" ry="8" fill="#222"/>
            <ellipse cx="50" cy="70" rx="12" ry="6" fill="#F97B5B"/>
            <rect x="46" y="10" width="8" height="20" rx="4" fill="#7ED957" stroke="#333" strokeWidth="2"/>
          </svg>
        ) : (
          <svg width={dimension} height={dimension * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="110" rx="32" ry="10" fill="#463A6E"/>
            <rect x="20" y="30" width="60" height="60" rx="20" fill="#3EC1D3" stroke="#333" strokeWidth="4"/>
            <rect x="35" y="80" width="30" height="20" rx="8" fill="#3EC1D3" stroke="#333" strokeWidth="3"/>
            <circle cx="50" cy="50" r="12" fill="#fff" stroke="#333" strokeWidth="2"/>
            <circle cx="50" cy="50" r="6" fill="#222"/>
            <rect x="40" y="60" width="20" height="8" rx="4" fill="#F97B5B"/>
            <circle cx="50" cy="20" r="7" fill="#FFD93D" stroke="#333" strokeWidth="2"/>
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
};

// Pulsing Glow Effect for Board Cells
export const PulsingGlow: React.FC<{ 
  isActive: boolean; 
  children: React.ReactNode;
}> = ({ isActive, children }) => {
  return (
    <motion.div
      className="relative"
      animate={isActive ? {
        boxShadow: [
          "0 0 0px #B57BFE",
          "0 0 20px #B57BFE",
          "0 0 0px #B57BFE"
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};
