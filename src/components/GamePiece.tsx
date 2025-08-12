import React from "react";

export type GamePieceType = "alien" | "robot";
export type GamePieceSize = "lg" | "md" | "sm";

const sizeMap = {
  lg: 120,
  md: 90,
  sm: 60,
};

interface GamePieceProps {
  type: GamePieceType;
  size: GamePieceSize;
}

export const GamePiece: React.FC<GamePieceProps> = ({ type, size }) => {
  const dimension = sizeMap[size];
  if (type === "alien") {
    return (
      <svg width={dimension} height={dimension * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="110" rx="32" ry="10" fill="#463A6E"/>
        <ellipse cx="50" cy="60" rx="40" ry="50" fill="#7ED957" stroke="#333" strokeWidth="4"/>
        <ellipse cx="50" cy="60" rx="30" ry="40" fill="#7ED957"/>
        <ellipse cx="50" cy="60" rx="18" ry="18" fill="#fff"/>
        <ellipse cx="50" cy="60" rx="8" ry="8" fill="#222"/>
        <ellipse cx="50" cy="70" rx="12" ry="6" fill="#F97B5B"/>
        <rect x="46" y="10" width="8" height="20" rx="4" fill="#7ED957" stroke="#333" strokeWidth="2"/>
      </svg>
    );
  }
  // robot
  return (
    <svg width={dimension} height={dimension * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="110" rx="32" ry="10" fill="#463A6E"/>
      <rect x="20" y="30" width="60" height="60" rx="20" fill="#3EC1D3" stroke="#333" strokeWidth="4"/>
      <rect x="35" y="80" width="30" height="20" rx="8" fill="#3EC1D3" stroke="#333" strokeWidth="3"/>
      <circle cx="50" cy="50" r="12" fill="#fff" stroke="#333" strokeWidth="2"/>
      <circle cx="50" cy="50" r="6" fill="#222"/>
      <rect x="40" y="60" width="20" height="8" rx="4" fill="#F97B5B"/>
      <circle cx="50" cy="20" r="7" fill="#FFD93D" stroke="#333" strokeWidth="2"/>
    </svg>
  );
}; 