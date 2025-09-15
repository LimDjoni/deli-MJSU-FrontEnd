'use client';

import { MJSUAPI } from '@/api';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { Department } from '@/types/EmployeeValues';
import { ptOptions } from '@/types/OptionsValue';
import React, { useEffect, useState } from 'react';

interface FilterFormPageProps {
  onApply: (filters: {
    pt?: string[];
    department_id?: string[];
  }) => void;
  onReset: () => void;
}

const FilterFormPage: React.FC<FilterFormPageProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [selectedPT, setSelectedPT] = useState<string[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);

  const handleReset = () => {
    setSelectedPT([]);
    setSelectedDepartment([]);
    onReset();
  };

  const handleApply = () => {
    onApply({
      pt: selectedPT.length > 0 ? selectedPT : undefined,
      department_id: selectedDepartment.length > 0 ? selectedDepartment : undefined,
    });
  };

  const handlePTChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedPT(selectedValues);
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedDepartment(selectedValues);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const departmentRes = await MJSUAPI({
          url: '/master/list/department',
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        const options = departmentRes.data.map((dept: Department) => ({
          label: dept.department_name,
          value: dept.ID.toString(),
        }));

        setDepartmentOptions(options);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Dashboard Manpower</h2>
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
          <label className="block text-sm font-medium mb-1">Nama Department</label>
          <select
            multiple
            className="w-full border rounded px-3 py-2"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            size={departmentOptions.length} // optional: shows all options without scrolling
          >
            {departmentOptions.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
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

export default FilterFormPage;
