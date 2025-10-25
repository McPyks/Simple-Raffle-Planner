// FIX: This file was empty. Added a functional React component to prevent import errors.
import React from 'react';
import { RaffleSlotType } from '../types';

interface WinnerModalProps {
  winner: RaffleSlotType;
  onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  if (!winner) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-green-500 to-cyan-500 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 text-center transform scale-100 transition-transform duration-500 ease-in-out relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="animate-pulse absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full mix-blend-screen filter blur-xl opacity-70"></div>
        <div className="animate-pulse absolute -bottom-4 -right-4 w-24 h-24 bg-pink-300 rounded-full mix-blend-screen filter blur-xl opacity-70 delay-1000"></div>

        <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">We have a winner!</h2>
        <p className="text-yellow-200 text-lg mb-6">Congratulations to slot #{winner.id}</p>

        <div className="bg-white/20 p-6 rounded-lg">
          <p className="text-5xl font-extrabold text-white break-words">{winner.name}</p>
          {winner.cabin && <p className="text-xl text-gray-200 mt-2">Cabin: {winner.cabin}</p>}
        </div>

        <button 
          onClick={onClose}
          className="mt-8 w-full bg-white/90 hover:bg-white text-gray-800 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;
