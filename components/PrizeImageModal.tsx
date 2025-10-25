import React, { useState, useRef, useEffect, TouchEvent, WheelEvent } from 'react';

interface PrizeImageModalProps {
  imageUrl: string;
  onClose: () => void;
  onDelete: () => void;
}

const PrizeImageModal: React.FC<PrizeImageModalProps> = ({ imageUrl, onClose, onDelete }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const initialPinchDistance = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInteractionStart = () => {
    isInteracting.current = true;
    document.body.style.overflow = 'hidden';
  };

  const handleInteractionEnd = () => {
    isInteracting.current = false;
    document.body.style.overflow = '';
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const scaleAmount = e.deltaY > 0 ? -0.1 : 0.1;
    setTransform(prev => {
      const newScale = Math.max(0.5, Math.min(prev.scale + scaleAmount, 5));
      return { ...prev, scale: newScale };
    });
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDistance.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      handleInteractionStart();
    } else if (e.touches.length === 1) {
      handleInteractionStart();
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isInteracting.current) return;
    
    if (e.touches.length === 2) {
      e.preventDefault();
      const newPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialPinchDistance.current > 0) {
        const scaleMultiplier = newPinchDistance / initialPinchDistance.current;
        setTransform(prev => {
           const newScale = Math.max(0.5, Math.min(prev.scale * scaleMultiplier, 5));
           return { ...prev, scale: newScale };
        });
        initialPinchDistance.current = newPinchDistance;
      }
    } else if (e.touches.length === 1) {
       e.preventDefault();
       setTransform(prev => ({
         ...prev,
         x: prev.x + e.touches[0].clientX - (containerRef.current?.dataset.lastTouchX ? parseFloat(containerRef.current.dataset.lastTouchX) : e.touches[0].clientX),
         y: prev.y + e.touches[0].clientY - (containerRef.current?.dataset.lastTouchY ? parseFloat(containerRef.current.dataset.lastTouchY) : e.touches[0].clientY),
       }));
    }
    if (containerRef.current && e.touches[0]) {
        containerRef.current.dataset.lastTouchX = String(e.touches[0].clientX);
        containerRef.current.dataset.lastTouchY = String(e.touches[0].clientY);
    }
  };
  
  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      initialPinchDistance.current = 0;
    }
     if (e.touches.length < 1) {
      handleInteractionEnd();
      if(containerRef.current) {
        delete containerRef.current.dataset.lastTouchX;
        delete containerRef.current.dataset.lastTouchY;
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    handleInteractionStart();
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
     if (isInteracting.current) {
        e.preventDefault();
        setTransform(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY }));
     }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 touch-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
    >
      <button
        onClick={onDelete}
        className="absolute top-4 left-4 p-2 rounded-full bg-black/50 hover:bg-red-600/80 transition-colors z-[52]"
        aria-label="Delete prize image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-white/30 transition-colors z-[52]"
        aria-label="Close image viewer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <img
            src={imageUrl}
            alt="Raffle Prize"
            className="max-w-full max-h-full object-contain cursor-grab"
            style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                transition: isInteracting.current ? 'none' : 'transform 0.1s ease-out',
                willChange: 'transform'
            }}
            draggable="false"
        />
      </div>

    </div>
  );
};

export default PrizeImageModal;
