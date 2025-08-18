'use client';

import React, { useState } from 'react';

interface FilterFormPageProps {
  onApply: (filters: {
    year?: string;
  }) => void;
  onReset: () => void;
}

const FilterFormPage: React.FC<FilterFormPageProps> = ({ onApply, onReset }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const handleReset = () => { 
    setSelectedYear(new Date().getFullYear().toString());
    onReset();
  };

  const handleApply = () => {
    onApply({
      year: selectedYear,
    });
  };
 
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };
   
  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Dashboard Backlog Control System</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> 
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
