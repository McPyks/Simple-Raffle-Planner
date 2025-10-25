// FIX: This file was empty. Added a functional React component to prevent import errors.
import React, { useRef, ChangeEvent } from 'react';
import { RaffleBoardType } from '../types';

interface MenuProps {
  board: RaffleBoardType;
  onDrawWinner: () => void;
  onSettings: () => void;
  onToggleView: () => void;
  isFullView: boolean;
  onGoHome: () => void;
  onAddPrizeImage: (e: ChangeEvent<HTMLInputElement>) => void;
  onViewPrizeImage: () => void;
}

const Menu: React.FC<MenuProps> = ({ board, onDrawWinner, onSettings, onToggleView, isFullView, onGoHome, onAddPrizeImage, onViewPrizeImage }) => {
  const prizeImageInputRef = useRef<HTMLInputElement>(null);

  const handlePrizeImageClick = () => {
    prizeImageInputRef.current?.click();
  }

  const filledSlots = board.slots.filter(s => s.name.trim() !== '').length;
  const paidSlots = board.slots.filter(s => s.paid).length;
  const totalSlots = board.slots.length;
  const progress = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;
  
  return (
    <div className="w-full bg-white/5 backdrop-blur-lg rounded-xl p-4 mb-4 border border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1 text-center md:text-left">
          <button onClick={onGoHome} className="text-gray-400 hover:text-white mb-2 text-sm">&larr; Back to Boards</button>
          <h1 className="text-2xl font-bold truncate">{board.title}</h1>
          <div className="text-sm text-gray-300 mt-1 flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start">
              <span>{filledSlots} / {totalSlots} Filled</span>
              <span>{paidSlots} / {filledSlots} Paid</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
           <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={prizeImageInputRef}
              onChange={onAddPrizeImage}
            />
          {board.prizeImage ? (
            <button onClick={onViewPrizeImage} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="View Prize Image">
              <img src={board.prizeImage} alt="Prize" className="w-8 h-8 object-cover rounded"/>
            </button>
          ) : (
             <button onClick={handlePrizeImageClick} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm" title="Add Prize Image">
                Add Prize
             </button>
          )}

          <button onClick={onToggleView} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm" title={isFullView ? "Detailed View" : "Compact View"}>
            {isFullView ? 'Detailed' : 'Compact'} View
          </button>
          <button onClick={onSettings} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">Settings</button>
          <button onClick={onDrawWinner} className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-colors shadow-lg">Draw Winner</button>
        </div>
      </div>
       <div className="w-full bg-gray-600 rounded-full h-1 mt-4">
        <div className="bg-green-500 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default Menu;
