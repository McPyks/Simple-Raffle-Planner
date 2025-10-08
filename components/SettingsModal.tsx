import React, { useRef, ChangeEvent } from 'react';

interface SettingsModalProps {
  boardTitle: string;
  onClose: () => void;
  onDelete: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onDownloadData: () => void;
  onUploadData: (event: ChangeEvent<HTMLInputElement>) => void;
  removalsLeft: number;
  onRemoveLicense: () => void;
}

const themes = [
  { id: 'midnight', name: 'Midnight', class: 'from-gray-700 to-gray-900' },
  { id: 'ocean', name: 'Ocean Deep', class: 'from-cyan-800 to-gray-900' },
  { id: 'forest', name: 'Forest Canopy', class: 'from-green-800 to-gray-900' },
  { id: 'royal', name: 'Royal Velvet', class: 'from-indigo-800 to-gray-900' },
  { id: 'sunset', name: 'Sunset Glow', class: 'from-rose-800 to-gray-900' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ boardTitle, onClose, onDelete, currentTheme, onThemeChange, onDownloadData, onUploadData, removalsLeft, onRemoveLicense }) => {
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteConfirm = () => {
    if (window.confirm(`Are you sure you want to permanently delete the "${boardTitle}" raffle board? This action cannot be undone.`)) {
      onDelete();
    }
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Board Settings</h2>
             <button onClick={onClose} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <p className="text-gray-300 mb-6">Manage settings for <span className="font-bold text-white">"{boardTitle}"</span>.</p>

        <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-gray-200">Theme</h3>
            <div className="grid grid-cols-5 gap-3">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => onThemeChange(theme.id)}
                        className={`h-12 w-full rounded-lg bg-gradient-to-br ${theme.class} border-2 transition-all duration-200 ${
                            currentTheme === theme.id ? 'border-white ring-2 ring-white/50' : 'border-transparent hover:border-white/50'
                        }`}
                        aria-label={`Select ${theme.name} theme`}
                        title={theme.name}
                    />
                ))}
            </div>
        </div>
        
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-3 text-gray-200">Data Management</h3>
            <p className="text-sm text-gray-400 mb-4">Save your data to a file or load it on another device.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onDownloadData}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.707a1 1 0 011.414 0L9 11.293V3a1 1 0 112 0v8.293l1.293-1.586a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Download Data</span>
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
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" />
                        <path d="M9 13.5V9m0 4.5l-2.5-2.5M9 13.5L11.5 11" />
                    </svg>
                    <span>Upload Data</span>
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                <h3 className="font-bold text-orange-300">Deactivate License</h3>
                <p className="text-sm text-orange-300/80 mt-1 mb-4">
                  Removes the license from this device to use it elsewhere. 
                  You have <span className="font-bold text-white">{removalsLeft}</span> {removalsLeft === 1 ? 'removal' : 'removals'} left.
                </p>
                <button
                    onClick={onRemoveLicense}
                    disabled={removalsLeft <= 0}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                    {removalsLeft > 0 ? 'Deactivate This Device' : 'No Removals Left'}
                </button>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                <h3 className="font-bold text-red-300">Danger Zone</h3>
                <p className="text-sm text-red-300/80 mt-1 mb-4">This action is permanent and cannot be undone.</p>
                 <button
                    onClick={handleDeleteConfirm}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                    Delete Raffle Board
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;