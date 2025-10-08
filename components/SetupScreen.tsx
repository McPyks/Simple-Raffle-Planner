import React, { useState } from 'react';

interface SetupScreenProps {
  onStart: (title: string, count: number) => void;
  onCancel: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onCancel }) => {
  const [title, setTitle] = useState('');
  const [slotCount, setSlotCount] = useState<string>('75');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(slotCount, 10);
     if (!title.trim()) {
      setError('Please enter a title for the raffle.');
      return;
    }
    if (isNaN(count) || count <= 0 || count > 500) {
      setError('Please enter a number of slots between 1 and 500.');
    } else {
      setError('');
      onStart(title, count);
    }
  };

  return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/20">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Raffle</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="raffleTitle" className="block text-gray-300 mb-2">
              Raffle Title
            </label>
            <input
              id="raffleTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 focus:outline-none transition duration-300"
              placeholder="e.g., iphone 15 pro"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="slotCount" className="block text-gray-300 mb-2">
              How many raffle slots?
            </label>
            <input
              id="slotCount"
              type="number"
              value={slotCount}
              onChange={(e) => setSlotCount(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-transparent focus:border-blue-400 focus:outline-none transition duration-300"
              placeholder="e.g., 75"
              min="1"
              max="500"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex gap-4">
            <button
                type="button"
                onClick={onCancel}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
            >
                Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupScreen;