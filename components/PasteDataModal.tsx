import React, { useState } from 'react';

interface PasteDataModalProps {
  onClose: () => void;
  onImport: (jsonString: string) => boolean;
}

const PasteDataModal: React.FC<PasteDataModalProps> = ({ onClose, onImport }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const handleImportClick = () => {
    if (!text.trim()) {
      setError('Please paste your backup data into the box.');
      return;
    }
    try {
      // Quick validation to see if it's likely JSON
      JSON.parse(text);
      setError('');
      // onImport function in App.tsx will handle the main logic and alerts
      const success = onImport(text);
      if (success) {
        onClose();
      } else {
        setError('Invalid data format. Please paste the exact text from your backup file.');
      }
    } catch (e) {
      setError('Invalid data format. The text could not be read.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Import Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Paste the content of your backup file (.json) into the text box below to import a raffle board.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your copied board data here..."
          className="w-full flex-grow bg-white/5 text-gray-200 p-3 rounded-lg border border-white/20 resize-none text-sm font-mono mb-4 focus:border-cyan-400 focus:outline-none transition-colors"
          rows={10}
        />
        {error && <p className="text-red-400 text-sm mb-4 -mt-2">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleImportClick} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            Import
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasteDataModal;
