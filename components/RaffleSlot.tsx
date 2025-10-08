import React from 'react';
import { RaffleSlotType } from '../types';

interface RaffleSlotProps {
  slot: RaffleSlotType;
  onClick: (id: number) => void;
  isFullView: boolean;
}

const RaffleSlot: React.FC<RaffleSlotProps> = ({ slot, onClick, isFullView }) => {
  const isFilled = slot.name.trim() !== '';

  const baseClasses = isFullView
    ? "relative aspect-square flex justify-center items-center rounded-sm cursor-pointer transition-transform duration-200 hover:scale-110 hover:z-10"
    : "relative aspect-square flex flex-col justify-center items-center p-2 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-110 hover:z-10 shadow-md";
  
  let backgroundClasses = "bg-white/10 border border-white/20 text-gray-300"; // Default for empty
  if (isFilled) {
      if (slot.paid) {
          backgroundClasses = "bg-green-500 border border-green-400 text-white"; // Paid
      } else {
          backgroundClasses = "bg-orange-500 border border-orange-400 text-white"; // Filled, not paid
      }
  }

  return (
    <div
      className={`${baseClasses} ${backgroundClasses}`}
      onClick={() => onClick(slot.id)}
    >
      {isFilled && slot.paid && (
        <div className="absolute top-1 right-1 text-white text-opacity-90">
          <svg xmlns="http://www.w3.org/2000/svg" className={isFullView ? "h-3 w-3" : "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
          </svg>
        </div>
      )}
      {isFullView ? (
        <div className="font-medium select-none text-sm md:text-base">{slot.id}</div>
      ) : (
        <>
          <div className="font-bold text-xl sm:text-2xl">{slot.id}</div>
          {isFilled && (
            <div className="text-xs text-center truncate w-full px-1">{slot.name}</div>
          )}
          {!isFilled && (
             <div className="text-xs text-center opacity-70">Empty</div>
          )}
        </>
      )}
    </div>
  );
};

export default RaffleSlot;