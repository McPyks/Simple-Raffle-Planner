import React, { useState } from 'react';

interface LicenseModalProps {
  onSubmit: (key: string) => void;
  status: 'idle' | 'loading' | 'error';
  error: string;
  details?: string;
}

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


const LicenseModal: React.FC<LicenseModalProps> = ({ onSubmit, status, error, details }) => {
  const [licenseKey, setLicenseKey] = useState('');

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const limitedValue = rawValue.substring(0, 16);
    const formattedValue = (limitedValue.match(/.{1,4}/g) || []).join('-');
    setLicenseKey(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (licenseKey.trim()) {
      onSubmit(licenseKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-lg flex justify-center items-center z-[100] p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Application Locked</h2>
        <p className="text-gray-300 mb-6">Please enter your license key to continue.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={licenseKey}
              onChange={handleLicenseChange}
              maxLength={19}
              className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-3 rounded-lg border-2 border-transparent focus:border-cyan-400 focus:outline-none transition duration-300 text-center font-mono tracking-widest"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              aria-label="License Key"
              disabled={status === 'loading'}
            />
          </div>

          {status === 'error' && (
             <div className="text-red-400 text-sm mb-4 bg-red-900/30 py-3 px-4 rounded-lg text-left">
                <p className="font-semibold">{error}</p>
                {details && (
                    <div className="mt-2 pt-2 border-t border-red-400/30">
                        <p className="text-red-300">
                            <span className="font-medium">Activation Info:</span> {details}
                        </p>
                        <p className="text-xs text-red-400/80 mt-1">
                            To use this key on a new device, please open the app on the device described above, go to Settings, and select "Deactivate This Device".
                        </p>
                    </div>
                )}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || licenseKey.length < 19}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center gap-3"
          >
            {status === 'loading' && <LoadingSpinner />}
            <span>{status === 'loading' ? 'Verifying...' : 'Submit'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LicenseModal;