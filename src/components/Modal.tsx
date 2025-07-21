import React from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-black text-xl font-bold">
          ✕
        </button> 
        
        {children}
      </div>
    </div>
  );
};

export default FilterModal;