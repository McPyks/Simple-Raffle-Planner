import React, { useState } from 'react';

interface ManualBackupModalProps {
  data: string;
  fileName: string;
  onClose: () => void;
}

const ManualBackupModal: React.FC<ManualBackupModalProps> = ({ data, fileName, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  const handleCopy = () => {
    navigator.clipboard.writeText(data).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Copy Failed!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manual Backup</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-gray-300 text-sm space-y-2 mb-4">
          <p>Your browser may not support direct downloads. Please follow these steps:</p>
          <ol className="list-decimal list-inside pl-2 space-y-1">
            <li>Click the "Copy to Clipboard" button below.</li>
            <li>Open a text editor (like Notes) on your device.</li>
            <li>Paste the copied text.</li>
            <li>Save the file with the name: <strong className="text-cyan-400 break-all">{fileName}</strong></li>
          </ol>
        </div>
        <textarea
          readOnly
          value={data}
          className="w-full flex-grow bg-white/5 text-gray-200 p-3 rounded-lg border border-white/20 resize-none text-xs font-mono mb-4"
          rows={10}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleCopy} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            {copyButtonText}
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualBackupModal;