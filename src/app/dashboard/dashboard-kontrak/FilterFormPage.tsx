'use client';

import { ptOptions } from '@/types/OptionsValue';
import React, { useState } from 'react';

interface FilterFormPageProps {
  onApply: (filters: {
    pt?: string[];
    year?: string;
  }) => void;
  onReset: () => void;
}

const FilterFormPage: React.FC<FilterFormPageProps> = ({ onApply, onReset }) => {
  const [selectedPT, setSelectedPT] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const handleReset = () => {
    setSelectedPT([]);
    setSelectedYear(new Date().getFullYear().toString());
    onReset();
  };

  const handleApply = () => {
    onApply({
      pt: selectedPT.length > 0 ? selectedPT : undefined,
      year: selectedYear,
    });
  };


  const handlePTChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedPT(selectedValues);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };
   
  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Dashboard Turnover</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nama PT</label>
          <select
            multiple
            className="w-full border rounded px-3 py-2"
            value={selectedPT}
            onChange={handlePTChange}
            size={ptOptions.length} // optional: shows all options without scrolling
          >
            {ptOptions.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Tahun</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedYear}
            onChange={handleYearChange}
          >
            {Array.from({ length: 6 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year.toString()}>{year}</option>;
            })}
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

export default FilterFormPage;
