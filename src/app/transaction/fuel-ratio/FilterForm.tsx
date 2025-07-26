import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MrpAPI } from '@/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterFormProps {
  onApply: (filters: {
    unit_id?: string;
    operator_name?: string;
    shift?: string;
    tanggal?: string;
    status?: string;
  }) => void;
  onReset: () => void;
} 

type Unit = {
  ID: number;
  unit_name: string;
};

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [unit, setUnit] = useState<Unit[]>([]);
  const [selectedFirstHm, setSelectedFirstHm] = useState<Date | null>(null);
  const [status, setStatus] = useState<boolean | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | undefined>(undefined);
  const [selectedEmployee, setSelectedEmployee] = useState<string | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<string | undefined>(undefined);

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [unitRes] = await Promise.all([
          MrpAPI({
            url: '/unit/list',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
        ]);
        setUnit(unitRes.data); 
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const handleReset = () => {
    setSelectedUnit(undefined);
    setSelectedEmployee(undefined);
    setSelectedShift(undefined);
    setSelectedFirstHm(null);
    setStatus(null);
    onReset();
  };

  const handleApply = () => {
    const selectedUnitName = unit.find((eq) => eq.ID === selectedUnit)?.unit_name; 

    onApply({
      unit_id: selectedUnitName || '',
      operator_name: selectedEmployee || '',
      shift: selectedShift || '',
      tanggal: selectedFirstHm ? formatToLocalTime(selectedFirstHm.toISOString()) : '',
      status: status === null ? '' : String(status),
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Fuel Ratio</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Unit</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedUnit ?? ''}
            onChange={(e) => setSelectedUnit(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Pilih Nama Unit</option>
            {unit.map((b) => (
              <option key={b.ID} value={b.ID}>
                {b.unit_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Operator</label>
          <input
            type="text"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value ?? '')}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Nama Operator"
          />
        </div>   
        <div>
          <label className="block text-sm font-medium mb-1">Shift</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedShift ?? ''}
            onChange={(e) => setSelectedShift(e.target.value || undefined)}
          >
            <option value="">Pilih Shift</option>
            <option value="Shift 1">Shift 1</option>
            <option value="Shift 2">Shift 2</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tanggal</label>
          <DatePicker
            selected={selectedFirstHm}
            onChange={(date: Date | null) => setSelectedFirstHm(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full border rounded px-3 py-2"
            placeholderText="Pilih Tanggal"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <div className="flex items-center gap-4 mt-1">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-green-500 mr-2"
                checked={status === true}
                onChange={() => setStatus(status === true ? null : true)}
              />
              <span className="inline-block w-10 h-10 rounded-md bg-green-500 border-2 border-transparent"></span>
            </label>

            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-yellow-400 mr-2"
                checked={status === false}
                onChange={() => setStatus(status === false ? null : false)}
              />
              <span className="inline-block w-10 h-10 rounded-md bg-yellow-400 border-2 border-transparent"></span>
            </label>
          </div>
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
