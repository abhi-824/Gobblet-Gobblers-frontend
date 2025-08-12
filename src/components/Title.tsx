import React from "react";

export const Title: React.FC = () => (
  <h1
    className="text-5xl md:text-7xl font-extrabold text-center mb-8"
    style={{
      color: '#FFD93D',
      textShadow:
        '0 0.5px 8px #fff, 0 0px 8px #6520ED, 0 2px 0 #FDF360, 0 2px 8px #6520ED',
      fontFamily: 'Luckiest Guy, Impact, Arial Black, sans-serif',
      letterSpacing: '0.05em',
    }}
  >
    <span className="block text-[#FFD93D] drop-shadow-[0_2px_8px_#fff]">ALIENS</span>
    <span className="block text-white -mt-2 drop-shadow-[0_2px_16px_#6520ED]">vs ROBOTS</span>
  </h1>
); 