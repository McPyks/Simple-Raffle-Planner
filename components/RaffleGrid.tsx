import React from 'react';
import { RaffleSlotType } from '../types';
import RaffleSlot from './RaffleSlot';

interface RaffleGridProps {
  slots: RaffleSlotType[];
  onSlotClick: (id: number) => void;
  isFullView: boolean;
}

const RaffleGrid: React.FC<RaffleGridProps> = ({ slots, onSlotClick, isFullView }) => {
  const gridClasses = isFullView
    ? "grid w-full gap-2"
    : "grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 xl:grid-cols-12 gap-3";
    
  const gridStyles = isFullView 
    ? { gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }
    : {};

  return (
    <div className={gridClasses} style={gridStyles}>
      {slots.map((slot) => (
        <RaffleSlot
          key={slot.id}
          slot={slot}
          onClick={onSlotClick}
          isFullView={isFullView}
        />
      ))}
    </div>
  );
};

export default RaffleGrid;