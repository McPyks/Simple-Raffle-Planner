// FIX: Replaced placeholder content with a fully functional root React component.
// This resolves the 'not a module' error in index.tsx and other compilation errors in this file.
import React, { useState, useEffect } from 'react';
import { RaffleBoardType, RaffleSlotType } from './types';
import HomePage from './components/HomePage';
import SetupScreen from './components/SetupScreen';
import RaffleGrid from './components/RaffleGrid';
import EditSlotModal from './components/EditSlotModal';
import WinnerModal from './components/WinnerModal';
import Menu from './components/Menu';
import SettingsModal from './components/SettingsModal';
import PrizeImageModal from './components/PrizeImageModal';
import LicenseModal from './components/LicenseModal';
import ManualBackupModal from './components/ManualBackupModal';
import PasteDataModal from './components/PasteDataModal';

// --- IMPORTANT ---
// PASTE THE WEB APP URL FROM YOUR GOOGLE APPS SCRIPT DEPLOYMENT HERE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHWDtdo6WBzL4Hi__IcJ2xLH7X-KBt_nwzmrHQYIOD8ESBpfMj2DGoi1k_jej5T44_/exec'; // <-- PASTE YOUR GOOGLE APPS SCRIPT URL HERE

const THEME_CLASSES: { [key: string]: string } = {
  midnight: 'from-gray-800 to-gray-900',
  ocean: 'from-cyan-800 to-gray-900',
  forest: 'from-green-800 to-gray-900',
  royal: 'from-indigo-800 to-gray-900',
  sunset: 'from-rose-800 to-gray-900',
};

const App: React.FC = () => {
  const [boards, setBoards] = useState<RaffleBoardType[]>([]);
  const [screen, setScreen] = useState<'home' | 'setup' | 'board'>('home');
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<RaffleSlotType | null>(null);
  const [winner, setWinner] = useState<RaffleSlotType | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrizeImageModalOpen, setIsPrizeImageModalOpen] = useState(false);
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [theme, setTheme] = useState('midnight');
  const [isFullView, setIsFullView] = useState(false);
  const [manualBackupData, setManualBackupData] = useState<{data: string, fileName: string} | null>(null);
  const [isLicensed, setIsLicensed] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [licenseError, setLicenseError] = useState('');
  const [licenseDetails, setLicenseDetails] = useState('');

  const activeBoard = boards.find(b => b.id === activeBoardId);
  const themeClass = THEME_CLASSES[theme] || THEME_CLASSES.midnight;

  useEffect(() => {
    try {
      if (localStorage.getItem('license_status') === 'valid') {
        setIsLicensed(true);
      }
      const savedBoards = localStorage.getItem('raffleBoards');
      if (savedBoards) {
        setBoards(JSON.parse(savedBoards));
      }
      const savedTheme = localStorage.getItem('raffleTheme');
      if (savedTheme && THEME_CLASSES[savedTheme]) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('raffleBoards', JSON.stringify(boards));
    } catch (error) {
      console.error("Failed to save boards to localStorage", error);
    }
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('raffleTheme', theme);
  }, [theme]);

  const handleSelectBoard = (id: string) => {
    setActiveBoardId(id);
    setScreen('board');
  };

  const handleGoHome = () => {
    setActiveBoardId(null);
    setScreen('home');
  };

  const handleStartRaffle = (title: string, count: number) => {
    const newBoard: RaffleBoardType = {
      id: new Date().toISOString() + Math.random(),
      title,
      slots: Array.from({ length: count }, (_, i) => ({ id: i + 1, name: '', cabin: '', note: '', paid: false })),
      currency: 'USD',
      slotPrice: 0,
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id);
    setScreen('board');
  };
  
  const handleSaveSlot = (updatedSlot: RaffleSlotType) => {
    if (!activeBoardId) return;
    setBoards(prev => prev.map(board => board.id === activeBoardId
      ? { ...board, slots: board.slots.map(s => s.id === updatedSlot.id ? updatedSlot : s) }
      : board
    ));
    setSelectedSlot(null);
  };
  
  const handleDrawWinner = () => {
    if (!activeBoard) return;
    const eligibleSlots = activeBoard.slots.filter(s => s.name.trim() !== '' && s.paid);
    if (eligibleSlots.length === 0) {
      alert("No eligible participants to draw from! (Must be filled and marked as paid)");
      return;
    }
    const winnerIndex = Math.floor(Math.random() * eligibleSlots.length);
    setWinner(eligibleSlots[winnerIndex]);
  };

  const handleDeleteBoard = () => {
    if (!activeBoardId) return;
    setBoards(prev => prev.filter(b => b.id !== activeBoardId));
    setIsSettingsOpen(false);
    handleGoHome();
  };

  const handleImportData = (text: string) => {
    try {
      const data = JSON.parse(text);
      if (Array.isArray(data)) { // Full backup
        setBoards(data);
        handleGoHome();
      } else if (data && data.id && data.title && data.slots) { // Single board
        setBoards(prev => {
          const exists = prev.some(b => b.id === data.id);
          if (exists) {
            if (window.confirm('A board with this ID already exists. Overwrite it?')) {
              return prev.map(b => b.id === data.id ? data : b);
            }
            return prev;
          }
          return [...prev, data];
        });
        if(screen !== 'home') handleGoHome();
      } else { throw new Error("Invalid data format"); }
      setIsPasteModalOpen(false); // Close modal on success
      return true;
    } catch (error) {
      alert("Error loading data. It might be corrupt or not in the correct format.");
      console.error(error);
      return false;
    }
  };

  const handleDownloadData = () => {
    if (!activeBoard) return;
    const dataStr = JSON.stringify(activeBoard, null, 2);
    const fileName = `raffle-board-${activeBoard.title.replace(/\W/g, '_')}.json`;
    try {
      const blob = new Blob([dataStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.warn("Direct download failed, showing manual backup.", error);
      setManualBackupData({ data: dataStr, fileName });
    }
  };

  const handleAddPrizeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBoardId) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setBoards(boards => boards.map(b => b.id === activeBoardId ? { ...b, prizeImage: base64String } : b ));
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDeletePrizeImage = () => {
    if (activeBoardId) {
      if (window.confirm("Are you sure you want to delete the prize image?")) {
        setBoards(boards => boards.map(b => b.id === activeBoardId ? { ...b, prizeImage: undefined } : b));
        setIsPrizeImageModalOpen(false);
      }
    }
  };
  
  const handleLicenseSubmit = async (key: string) => {
    if (!SCRIPT_URL) {
        alert("Configuration error: The Google Apps Script URL is missing.");
        setLicenseStatus('idle');
        return;
    }
    setLicenseStatus('loading');
    setLicenseError('');
    setLicenseDetails('');

    try {
        const payload = {
            action: 'validate',
            key: key.replace(/-/g, ''),
        };

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        
        const result = await response.json();

        if (result.status === 'success') {
            setIsLicensed(true);
            setLicenseStatus('idle');
            localStorage.setItem('license_status', 'valid');
        } else {
            setLicenseStatus('error');
            setLicenseError(result.message || 'Invalid or Inactive License Key');
            setLicenseDetails(result.details || '');
        }
    } catch (error) {
        console.error("License validation fetch error:", error);
        setLicenseStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLicenseError('Network or script error.');
        setLicenseDetails(`Could not connect to the validation service. Please check your internet connection. Details: ${errorMessage}`);
    }
  };
  
  if (!isLicensed) {
    return <LicenseModal onSubmit={handleLicenseSubmit} status={licenseStatus} error={licenseError} details={licenseDetails} />;
  }

  return (
    <div className={`min-h-screen font-sans text-white bg-gradient-to-br ${themeClass} transition-colors duration-500`}>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {screen === 'home' && (
          <HomePage boards={boards} onSelectBoard={handleSelectBoard} onCreateNew={() => setScreen('setup')} onShowImportModal={() => setIsPasteModalOpen(true)} />
        )}
        {screen === 'setup' && (
          <SetupScreen onStart={handleStartRaffle} onCancel={() => setScreen('home')} />
        )}
        {screen === 'board' && activeBoard && (
          <>
            <Menu 
              board={activeBoard}
              onDrawWinner={handleDrawWinner}
              onSettings={() => setIsSettingsOpen(true)}
              onToggleView={() => setIsFullView(!isFullView)}
              isFullView={isFullView}
              onGoHome={handleGoHome}
              onAddPrizeImage={handleAddPrizeImage}
              onViewPrizeImage={() => setIsPrizeImageModalOpen(true)}
            />
            <RaffleGrid slots={activeBoard.slots} onSlotClick={(id) => setSelectedSlot(activeBoard.slots.find(s => s.id === id) || null)} isFullView={isFullView} />
          </>
        )}
      </main>

      {selectedSlot && (
        <EditSlotModal slot={selectedSlot} onSave={handleSaveSlot} onClose={() => setSelectedSlot(null)} />
      )}
      {winner && <WinnerModal winner={winner} onClose={() => setWinner(null)} />}
      {isSettingsOpen && activeBoard && (
        <SettingsModal 
          boardTitle={activeBoard.title}
          onClose={() => setIsSettingsOpen(false)} 
          onDelete={handleDeleteBoard}
          currentTheme={theme}
          onThemeChange={setTheme}
          onDownloadData={handleDownloadData}
          onShowImportModal={() => setIsPasteModalOpen(true)}
          removalsLeft={2} // Mock value
          onRemoveLicense={() => alert("This is a demo. License cannot be removed.")}
        />
      )}
      {isPrizeImageModalOpen && activeBoard?.prizeImage && (
        <PrizeImageModal imageUrl={activeBoard.prizeImage} onClose={() => setIsPrizeImageModalOpen(false)} onDelete={handleDeletePrizeImage} />
      )}
      {manualBackupData && (
        <ManualBackupModal data={manualBackupData.data} fileName={manualBackupData.fileName} onClose={() => setManualBackupData(null)} />
      )}
      {isPasteModalOpen && (
        <PasteDataModal
          onClose={() => setIsPasteModalOpen(false)}
          onImport={handleImportData}
        />
      )}
    </div>
  );
};

export default App;