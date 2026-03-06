import React from 'react';
import { Card } from '../utils/gameLogic';
import { motion } from 'motion/react';

interface CardViewProps {
  card: Card;
  faceUp: boolean;
  highlighted?: boolean;
  index: number;
  size?: 'sm' | 'md' | 'lg';
}

export const CardView: React.FC<CardViewProps> = ({ card, faceUp, highlighted = false, index, size = 'md' }) => {
  const isRed = card.suit === '♥' || card.suit === '♦';

  const sizeClasses = {
    sm: 'w-10 h-14 sm:w-14 sm:h-20 md:w-16 md:h-24',
    md: 'w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28',
    lg: 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-36'
  };

  const fontClasses = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-sm sm:text-lg'
  };

  const suitClasses = {
    sm: 'text-lg sm:text-2xl',
    md: 'text-xl sm:text-3xl',
    lg: 'text-2xl sm:text-4xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: highlighted ? -16 : 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative perspective-1000"
    >
      <motion.div
        className={`${sizeClasses[size]} relative preserve-3d`}
        animate={{ rotateY: faceUp ? 0 : 180 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front of card */}
        <div 
          className={`absolute w-full h-full backface-hidden bg-white rounded-lg border-2 flex flex-col justify-between p-1 shadow-md
            ${highlighted ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'border-gray-200'}
          `}
        >
          <div className={`${fontClasses[size]} font-bold leading-none ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
            {card.rank}
          </div>
          <div className={`${suitClasses[size]} self-center ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
            {card.suit}
          </div>
          <div className={`${fontClasses[size]} font-bold leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
            {card.rank}
          </div>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full backface-hidden bg-indigo-800 rounded-lg border-2 border-white shadow-md flex items-center justify-center rotate-y-180"
        >
          <div className="w-full h-full m-0.5 sm:m-1 border border-indigo-400 rounded flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.1)_5px,rgba(255,255,255,0.1)_10px)]">
            <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-indigo-600 opacity-50"></div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
