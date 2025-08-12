import React from "react";
import { motion } from "framer-motion";

interface GameBoardProps {
  highlights?: [number, number][];
}

export const GameBoard: React.FC<GameBoardProps> = ({ highlights = [] }) => {
  const isHighlighted = (row: number, col: number) =>
    highlights.some(([r, c]) => r === row && c === col);

  return (
    <motion.div
      className="w-[320px] h-[320px] rounded-[28px] p-[6px] bg-[#B57BFE] shadow-xl"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="w-[296px] h-[296px] rounded-[24px] bg-[#4653AE] grid grid-cols-3 grid-rows-3 gap-[10px] p-[10px]">
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const isActive = isHighlighted(row, col);
            return (
              <div
                key={`${row}-${col}`}
                className={`flex items-center justify-center rounded-[18px] ${isActive ? "bg-[#B57BFE]" : "bg-[#D3D9FF]"
                  }`}
              >
                {/* Drop Shadow Element */}
                <div className="w-10 h-2 rounded-full bg-[#B284FB] opacity-60 mt-8" />
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
