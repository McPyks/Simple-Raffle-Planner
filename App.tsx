import React, { useState, useEffect, ChangeEvent } from 'react';
import { RaffleSlotType, RaffleBoardType } from './types';
import SetupScreen from './components/SetupScreen';
import RaffleGrid from './components/RaffleGrid';
import EditSlotModal from './components/EditSlotModal';
import HomePage from './components/HomePage';
import SettingsModal from './components/SettingsModal';
import ManualBackupModal from './components/ManualBackupModal';
import LicenseModal from './components/LicenseModal';

const themes: { [key: string]: string } = {
  midnight: 'from-gray-700 via-gray-800 to-gray-900', // Default
  ocean: 'from-cyan-800 via-blue-900 to-gray-900',
  forest: 'from-green-800 via-emerald-900 to-gray-900',
  royal: 'from-indigo-800 via-purple-900 to-gray-900',
  sunset: 'from-rose-800 via-red-900 to-gray-900',
};

const App: React.FC = () => {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [activationStatus, setActivationStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [activationError, setActivationError] = useState<string>('');
  
  const [view, setView] = useState<'home' | 'setup' | 'board'>('home');
  const [boards, setBoards] = useState<RaffleBoardType[]>(() => {
    try {
      const savedBoards = window.localStorage.getItem('raffleBoards');
      return savedBoards ? JSON.parse(savedBoards) : [];
    } catch (error) {
      console.error("Could not parse saved boards, starting fresh:", error);
      return [];
    }
  });
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<RaffleSlotType | null>(null);
  const [animatedNumber, setAnimatedNumber] = useState<number>(0);
  const [isFullView, setIsFullView] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => {
    return window.localStorage.getItem('raffleTheme') || 'midnight';
  });
  const [manualBackupData, setManualBackupData] = useState<{data: string, fileName: string} | null>(null);
  const [removalsLeft, setRemovalsLeft] = useState<number>(() => {
    const savedCount = window.localStorage.getItem('raffleRemovalsLeft');
    return savedCount ? parseInt(savedCount, 10) : 0;
  });

  useEffect(() => {
    // Check for activation status on load
    const activated = window.localStorage.getItem('raffleActivated_v1') === 'true';
    setIsActivated(activated);
  }, []);

  // Persist boards to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem('raffleBoards', JSON.stringify(boards));
    } catch (error) {
      console.error("Could not save boards:", error);
    }
  }, [boards]);

  // Persist theme to localStorage
  useEffect(() => {
    window.localStorage.setItem('raffleTheme', theme);
  }, [theme]);

  // Persist removals count to localStorage
  useEffect(() => {
    window.localStorage.setItem('raffleRemovalsLeft', String(removalsLeft));
  }, [removalsLeft]);
  
  // Navigate home if the active board gets deleted
  useEffect(() => {
    if (activeBoardId && !boards.some(board => board.id === activeBoardId)) {
      handleGoHome();
    }
  }, [boards, activeBoardId]);

  // Title number animation
  useEffect(() => {
    if (view === 'home' || view === 'setup') {
      const intervalId = setInterval(() => {
        setAnimatedNumber(Math.floor(Math.random() * 100));
      }, 80);
      return () => clearInterval(intervalId);
    }
  }, [view]);

  const activeBoard = boards.find(b => b.id === activeBoardId);

  const handleGoToSetup = () => {
    setIsFullView(false);
    setView('setup');
  };

  const handleCreateBoard = (title: string, count: number) => {
    const newBoard: RaffleBoardType = {
      id: `board-${Date.now()}`,
      title,
      slots: Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: '',
        cabin: '',
        note: '',
        paid: false,
      })),
      currency: 'USD',
      slotPrice: 0,
    };
    setBoards(prevBoards => [...prevBoards, newBoard]);
    setActiveBoardId(newBoard.id);
    setView('board');
  };

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setView('board');
    setIsFullView(false);
  };
  
  const handleGoHome = () => {
    setActiveBoardId(null);
    setView('home');
    setIsFullView(false);
  };

  const handleDeleteBoard = (boardId: string) => {
    setBoards(prevBoards => prevBoards.filter(board => board.id !== boardId));
  };

  const handleDeleteActiveBoard = () => {
    if (!activeBoardId) return;
    handleDeleteBoard(activeBoardId);
    setIsSettingsModalOpen(false);
  };

  const toggleFullView = () => {
    setIsFullView(prev => !prev);
  };

  const handleOpenEditModal = (slotId: number) => {
    const board = boards.find(b => b.id === activeBoardId);
    if (!board) return;
    const slotToEdit = board.slots.find(s => s.id === slotId);
    if (slotToEdit) {
      setEditingSlot(slotToEdit);
    }
  };

  const handleCloseEditModal = () => {
    setEditingSlot(null);
  };

  const handleSaveSlot = (updatedSlot: RaffleSlotType) => {
    if (!activeBoardId) return;
    setBoards(prevBoards =>
      prevBoards.map(board => {
        if (board.id === activeBoardId) {
          return {
            ...board,
            slots: board.slots.map(slot =>
              slot.id === updatedSlot.id ? updatedSlot : slot
            )
          };
        }
        return board;
      })
    );
    handleCloseEditModal();
  };

  const handleUpdateBoardConfig = (boardId: string, updatedConfig: Partial<Pick<RaffleBoardType, 'currency' | 'slotPrice' | 'title'>>) => {
    setBoards(prevBoards =>
      prevBoards.map(board =>
        board.id === boardId ? { ...board, ...updatedConfig } : board
      )
    );
  };

  const handleDownloadData = async () => {
    if (boards.length === 0) {
      alert("There is no data to download.");
      return;
    }
    if (!activeBoard) {
      alert("Cannot download data without an active board to name the file.");
      return;
    }
  
    try {
      const dataStr = JSON.stringify(boards, null, 2);
      
      let safeTitle = 'backup';
      const title = activeBoard.title;
      if (title && title.trim()) {
        const processedTitle = title.trim()
          .toLowerCase()
          .replace(/[\s\W_]+/g, '-')
          .replace(/^-+|-+$/g, '');
        if (processedTitle) {
          safeTitle = processedTitle;
        }
      }
      
      const date = new Date().toISOString().slice(0, 10);
      const fileName = `Simple-raffle-${safeTitle}-${date}.json`;
  
      const triggerManualBackup = () => {
        setManualBackupData({ data: dataStr, fileName });
      };
      
      const blob = new Blob([dataStr], { type: 'application/json' });
  
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: 'application/json' });
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Raffle Data Backup',
              text: `Backup file: ${fileName}`,
            });
            return;
          } catch (error) {
            if ((error as DOMException)?.name === 'AbortError') { return; }
            console.warn("Web Share API failed, falling back.", error);
            triggerManualBackup();
            return;
          }
        }
      }
  
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(`Data successfully downloaded as "${fileName}". Please check your device's 'Downloads' folder.`);
      } catch (desktopError) {
        console.error("Failed to download data via link, falling back:", desktopError);
        triggerManualBackup();
      }
    } catch (error) {
      console.error("Failed to prepare data for download:", error);
      alert("An error occurred while preparing your data for download.");
    }
  };

  const handleUploadData = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File content is not readable.");
        }
        const uploadedBoards: RaffleBoardType[] = JSON.parse(text);

        if (!Array.isArray(uploadedBoards) || (uploadedBoards.length > 0 && (!uploadedBoards[0].id || !uploadedBoards[0].title || !uploadedBoards[0].slots))) {
           throw new Error("Invalid data format. Please make sure it's a valid raffle backup file.");
        }
        
        const existingBoardTitles = new Set(boards.map(board => board.title.trim()));
        const newBoardsToAdd = uploadedBoards.filter(
          (uploadedBoard) => uploadedBoard.title && !existingBoardTitles.has(uploadedBoard.title.trim())
        );

        if (newBoardsToAdd.length > 0) {
          setBoards(prevBoards => [...prevBoards, ...newBoardsToAdd]);
          alert(`${newBoardsToAdd.length} new board(s) imported successfully!`);
          setIsSettingsModalOpen(false);
        } else {
          alert("No new boards to import. All boards in the file either already exist or have invalid titles.");
        }

      } catch (error) {
        console.error("Failed to upload data:", error);
        alert(`Failed to import data. Please make sure the file is a valid raffle data backup. Error: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
        alert("An error occurred while reading the file.");
        event.target.value = '';
    };
    reader.readAsText(file);
  };
  
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-yxaHpf6bhq9QQuYd46Gz5qB9R-b1y30QRvKALsWQpQmGoq2ljFVhAg2RX1ZtlmHM/exec';

  const handleLicenseSubmit = async (key: string) => {
    setActivationStatus('loading');
    setActivationError('');

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'validate', key: key }),
        mode: 'cors',
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        window.localStorage.setItem('raffleActivated_v1', 'true');
        window.localStorage.setItem('lastUsedKey', key);
        setRemovalsLeft(result.removalsLeft);
        setIsActivated(true);
        setActivationStatus('idle');
      } else {
        throw new Error(result.message || 'Invalid license key.');
      }
    } catch (error) {
      console.error('Activation failed:', error);
      setActivationStatus('error');
      setActivationError(error instanceof Error ? error.message : 'An unknown error occurred. Please check your internet connection.');
    }
  };

  const handleRemoveLicense = async () => {
    if (!window.confirm('Are you sure you want to remove the license from this device? This will lock the application and use one of your available removals.')) {
      return;
    }

    const currentKey = window.localStorage.getItem('lastUsedKey');
    if (!currentKey) {
      alert('Error: Could not find the current license key to remove.');
      return;
    }

    // You might want a loading state here for better UX
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'remove', key: currentKey }),
        mode: 'cors',
      });

      const result = await response.json();

      if (result.status === 'success') {
        window.localStorage.removeItem('raffleActivated_v1');
        window.localStorage.removeItem('lastUsedKey');
        // The removalsLeft count is updated from the server's new value
        setRemovalsLeft(result.removalsLeft);
        setIsActivated(false);
        setIsSettingsModalOpen(false);
        alert('License successfully removed. The application is now locked.');
      } else {
        throw new Error(result.message || 'Failed to remove license.');
      }
    } catch (error) {
      console.error('License removal failed:', error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br ${themes[theme] || themes.midnight} text-white`}>
      {!isActivated && (
        <LicenseModal 
          onSubmit={handleLicenseSubmit}
          status={activationStatus}
          error={activationError}
        />
      )}

      {isFullView && activeBoard && (
        <header className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center p-4 bg-gray-900/60 backdrop-blur-sm h-20">
          <h2 className="text-xl font-bold text-white truncate">{activeBoard.title}</h2>
          <button
            onClick={toggleFullView}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            aria-label="Exit full view"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4m0 0v4m0-4l5 5m7-5h4m0 0v4m0-4l-5 5M8 20H4m0 0v-4m0 4l5-5m7 5h4m0 0v-4m0 4l-5-5" />
            </svg>
          </button>
        </header>
      )}
      
      <main className={`flex-grow transition-all duration-300 ${isFullView ? 'p-4 pt-24' : 'p-4 sm:p-6 lg:p-8'}`}>
        <div className={`${isFullView ? 'w-full h-full' : 'container mx-auto'}`}>
          {!isFullView && (
            <header className="text-center mb-8">
               {view === 'board' && activeBoard ? (
                  <input
                    type="text"
                    value={activeBoard.title}
                    onChange={(e) => activeBoardId && handleUpdateBoardConfig(activeBoardId, { title: e.target.value })}
                    className="w-full max-w-3xl mx-auto bg-transparent text-center text-4xl sm:text-5xl font-bold tracking-tight text-white text-shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-lg py-1 transition"
                    aria-label="Raffle Board Title"
                    placeholder="Enter Raffle Title"
                  />
                ) : (
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-shadow flex items-center justify-center gap-3">
                    <span>Simple Raffle</span>
                    <span className="bg-cyan-400 text-gray-900 font-mono font-bold text-3xl px-3 py-1 rounded-md ml-2 tabular-nums w-[60px] text-center">
                      {animatedNumber.toString().padStart(2, '0')}
                    </span>
                  </h1>
                )}

              {view === 'board' && activeBoard ? (
                <div className="mt-6 flex justify-between items-start">
                  <div className="flex flex-col items-start gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="currency" className="text-gray-300 text-sm font-medium">Currency:</label>
                      <select
                        id="currency"
                        value={activeBoard.currency}
                        onChange={(e) => activeBoardId && handleUpdateBoardConfig(activeBoardId, { currency: e.target.value as 'USD' | 'EUR' })}
                        className="bg-white/10 text-white px-3 py-1 rounded-lg border-2 border-transparent focus:border-cyan-400 focus:outline-none transition"
                      >
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <button onClick={handleGoHome} className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors" aria-label="Go to home">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </button>
                      <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors" aria-label="Board settings">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button onClick={toggleFullView} className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors" aria-label="Enter full view">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor="slotPrice" className="text-gray-300 text-sm font-medium">Price per Slot:</label>
                      <input id="slotPrice" type="number" value={activeBoard.slotPrice > 0 ? activeBoard.slotPrice : ''} onChange={(e) => activeBoardId && handleUpdateBoardConfig(activeBoardId, { slotPrice: Number(e.target.value) < 0 ? 0 : Number(e.target.value) })} className="w-24 bg-white/10 text-white px-3 py-1 rounded-lg border-2 border-transparent focus:border-cyan-400 focus:outline-none transition" placeholder="e.g., 10" min="0" />
                    </div>
                     <p className="text-gray-300 text-lg font-medium"> Slots Filled: {activeBoard.slots.filter(s => s.name.trim() !== '').length} / {activeBoard.slots.length} </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 mt-2 text-lg"> A simple board for your party raffle participants. </p>
              )}
            </header>
          )}

          {view === 'home' && <HomePage boards={boards} onSelectBoard={handleSelectBoard} onCreateNew={handleGoToSetup} onUploadData={handleUploadData} />}
          {view === 'setup' && <SetupScreen onStart={handleCreateBoard} onCancel={() => setView('home')} />}
          {view === 'board' && activeBoard && (
            <RaffleGrid slots={activeBoard.slots} onSlotClick={handleOpenEditModal} isFullView={isFullView} />
          )}
        </div>
      </main>

      {editingSlot && (
        <EditSlotModal slot={editingSlot} onSave={handleSaveSlot} onClose={handleCloseEditModal} />
      )}

      {isSettingsModalOpen && activeBoard && (
        <SettingsModal 
            boardTitle={activeBoard.title} 
            onClose={() => setIsSettingsModalOpen(false)} 
            onDelete={handleDeleteActiveBoard} 
            currentTheme={theme} 
            onThemeChange={setTheme} 
            onDownloadData={handleDownloadData} 
            onUploadData={handleUploadData}
            removalsLeft={removalsLeft}
            onRemoveLicense={handleRemoveLicense}
        />
      )}

      {manualBackupData && (
        <ManualBackupModal data={manualBackupData.data} fileName={manualBackupData.fileName} onClose={() => setManualBackupData(null)} />
      )}
      
      {!isFullView && (
        <footer className="w-full text-center py-4 mt-auto">
          <p className="text-xs text-gray-500"> © 2025 McPyks TechMaster. All Rights Reserved. | v1.0.0 </p>
        </footer>
      )}
    </div>
  );
};

export default App;