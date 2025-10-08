import React, { useRef, ChangeEvent } from 'react';
import { RaffleBoardType } from '../types';

interface HomePageProps {
  boards: RaffleBoardType[];
  onSelectBoard: (id: string) => void;
  onCreateNew: () => void;
  onUploadData: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface BoardCardProps {
  board: RaffleBoardType;
  onSelect: (id: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onSelect }) => {
  const filledSlots = board.slots.filter(s => s.name.trim() !== '').length;
  const totalSlots = board.slots.length;
  const progress = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;

  return (
    <div 
      onClick={() => onSelect(board.id)}
      className="relative bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg border border-white/20 text-left w-full transition-all duration-300 hover:bg-white/20 hover:scale-105 cursor-pointer group"
    >
      <div className="pr-6">
        <h3 className="text-lg font-bold truncate">{board.title}</h3>
      </div>

      {board.slotPrice > 0 && (
        <p className="text-cyan-400 text-sm font-semibold mt-1">
          {new Intl.NumberFormat(undefined, { style: 'currency', currency: board.currency }).format(board.slotPrice)} / slot
        </p>
      )}

      <p className="text-gray-300 text-sm mt-2">{filledSlots} / {totalSlots} participants</p>
      <div className="w-full bg-gray-600 rounded-full h-1.5 mt-2">
        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}

const HomePage: React.FC<HomePageProps> = ({ boards, onSelectBoard, onCreateNew, onUploadData }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      
      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map(board => (
            <BoardCard 
              key={board.id} 
              board={board} 
              onSelect={onSelectBoard}
            />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white/5 p-8 rounded-lg">
          <p className="text-gray-400 text-lg">You don't have any raffle boards yet.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
             <button 
                onClick={onCreateNew}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out w-full sm:w-auto"
              >
                Create Your First Raffle
              </button>
               <input
                    type="file"
                    ref={uploadInputRef}
                    onChange={onUploadData}
                    className="hidden"
                    accept="application/json"
                />
                <button
                    onClick={handleUploadClick}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" />
                        <path d="M9 13.5V9m0 4.5l-2.5-2.5M9 13.5L11.5 11" />
                    </svg>
                    <span>Upload Data</span>
                </button>
          </div>
        </div>
      )}

      {boards.length > 0 && (
         <div className="text-center mt-12">
            <button 
                onClick={onCreateNew}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
                Create New Raffle Board
            </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;