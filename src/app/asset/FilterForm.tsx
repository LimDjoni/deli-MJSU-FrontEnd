import { assetTypeOptions, ukuranOptions } from '@/types/AssetValues';
import React, { useState } from 'react'; 

interface FilterFormProps {
  onApply: (filters: {
    asset_type?: string;
    ukuran?: string; 
  }) => void;
  onReset: () => void;
} 

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {  
  const [selectedAssetType, setSelectedAssetType] = useState<string | undefined>(undefined);
  const [selectedUkuran, setSelectedUkuran] = useState<string | undefined>(undefined); 
 

  const handleReset = () => {
    setSelectedAssetType(undefined);
    setSelectedUkuran(undefined); 
    onReset(); // Notify parent to reset filtered data
  };

  const handleApply = () => { 
    onApply({
      asset_type: selectedAssetType,
      ukuran: selectedUkuran, 
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Asset</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Asset Type</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedAssetType ?? ''}
            onChange={(e) =>
              setSelectedAssetType(e.target.value ? e.target.value : undefined)
            }
          >
            <option value="">Pilih Asset</option>
            {assetTypeOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ukuran</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedUkuran ?? ''}
            onChange={(e) =>
              setSelectedUkuran(e.target.value ? e.target.value : undefined)
            }
          >
            <option value="">Pilih Ukuran</option>
            {ukuranOptions.map((eq) => (
              <option key={eq.value} value={eq.value}>
                {eq.label}
              </option>
            ))}
          </select>
        </div> 
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleReset}
          className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50"
        >
          Reset
        </button>
        <button
          onClick={handleApply}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Terapkan
        </button>
      </div>
    </>
  );
};

export default FilterForm;
