import React, { useState, useEffect } from 'react';
import { RaffleSlotType } from '../types';

interface EditSlotModalProps {
  slot: RaffleSlotType;
  onSave: (updatedSlot: RaffleSlotType) => void;
  onClose: () => void;
}

const EditSlotModal: React.FC<EditSlotModalProps> = ({ slot, onSave, onClose }) => {
  const [formData, setFormData] = useState<RaffleSlotType>(slot);

  useEffect(() => {
    setFormData(slot);
  }, [slot]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      if (window.confirm('Are you sure you want to mark this slot as paid?')) {
        setFormData(prev => ({ ...prev, paid: true }));
      }
    } else {
      setFormData(prev => ({ ...prev, paid: false }));
    }
  };
  
  const handleClear = () => {
    const clearedSlot = { ...slot, name: '', cabin: '', note: '', paid: false };
    onSave(clearedSlot);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Edit Slot #{slot.id}</h2>
           <div className="flex items-center gap-2">
            <label htmlFor="paid-checkbox" className="text-gray-300 font-medium cursor-pointer select-none">Paid</label>
            <input 
              type="checkbox"
              id="paid-checkbox"
              checked={formData.paid}
              onChange={handlePaidChange}
              className="w-6 h-6 rounded text-green-500 bg-gray-700 border-gray-600 focus:ring-green-600 cursor-pointer"
            />
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 mb-2">Participant Name</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border-2 border-transparent focus:border-blue-400 focus:outline-none" />
          </div>
          <div className="mb-4">
            <label htmlFor="cabin" className="block text-gray-300 mb-2">Cabin Number</label>
            <input id="cabin" name="cabin" type="text" value={formData.cabin} onChange={handleChange} className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border-2 border-transparent focus:border-blue-400 focus:outline-none" />
          </div>
          <div className="mb-6">
            <label htmlFor="note" className="block text-gray-300 mb-2">Note</label>
            <textarea id="note" name="note" value={formData.note} onChange={handleChange} className="w-full bg-white/10 text-white px-4 py-2 rounded-lg border-2 border-transparent focus:border-blue-400 focus:outline-none" rows={3}></textarea>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Save</button>
             <button type="button" onClick={handleClear} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Clear Slot</button>
             <button type="button" onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSlotModal;