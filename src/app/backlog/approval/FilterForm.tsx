import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MrpAPI } from '@/api';
import { Unit } from '@/types/FuelRatioValues';
import { componentOptions } from '@/types/OptionsValue';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface FilterFormProps {
  onApply: (filters: {
    unit_id?: number;
    component?: string; 
    date_of_inspection?: Date | string;
    plan_replace_repair?: string;
    po_number?: string;
    pp_number?: string; 
  }) => void;
  onReset: () => void;
} 

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [units, setUnits] = useState<Unit[]>([]); 

  const [selectedUnit, setSelectedUnit] = useState<number | undefined>(undefined); 
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>(); 
  const [selectedDateOfInspection, setSelectedDateOfInspection] = useState<Date | null>(null);
  const [selectedPlanReplaceRepair, setSelectedPlanReplaceRepair] = useState<Date | null>(null); 
 
  const [ppNumber, setPPNumber] = useState<string | undefined>();
  const [poNumber, setPONumber] = useState<string | undefined>(); 

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

        setUnits(unitRes.data); 
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const handleReset = () => {
    setSelectedUnit(undefined); 
    setSelectedComponent(undefined);  
    setSelectedDateOfInspection(null);
    setSelectedPlanReplaceRepair(null); 
    setPPNumber(undefined);
    setPONumber(undefined); 
    onReset(); // Notify parent to reset filtered data
  };

  const handleApply = () => { 
    onApply({
      unit_id: selectedUnit, 
      component: selectedComponent, 
      date_of_inspection: selectedDateOfInspection ? formatToLocalTime(selectedDateOfInspection.toISOString()) : '',
      plan_replace_repair: selectedPlanReplaceRepair ? formatToLocalTime(selectedPlanReplaceRepair.toISOString()) : '',
      pp_number: ppNumber,
      po_number: poNumber, 
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Backlog Control System</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedUnit ?? ''}
            onChange={(e) =>
              setSelectedUnit(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Unit</option>
            {units.map((b) => (
              <option key={b.ID} value={b.ID}>
                {b.unit_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Component</label>
          <select
            className="w-full border rounded px-3 py-2"
             value={selectedComponent ?? ''}
              onChange={(e) =>
                setSelectedComponent(e.target.value || undefined)
              }
          >
            <option value="">Pilih Component</option>
            {componentOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>  
        <div>
          <label className="block text-sm font-medium mb-1">Date Of Inspection</label>
          <DatePicker
            selected={selectedDateOfInspection}
            onChange={(date: Date | null) => setSelectedDateOfInspection(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full border rounded px-3 py-2"
            placeholderText="Pilih Date of Inspection"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Plan Replace and Repair Date</label>
          <DatePicker
            selected={selectedPlanReplaceRepair}
            onChange={(date: Date | null) => setSelectedPlanReplaceRepair(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full border rounded px-3 py-2"
            placeholderText="Pilih Plan Replace and Repair Date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PP Number</label>
          <input
            type="text"
            value={ppNumber ?? ''}
            onChange={(e) => setPPNumber(e.target.value || undefined)}
            className="w-full border rounded px-3 py-2"
          />
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">PO Number</label>
          <input
            type="text"
            value={poNumber ?? ''}
            onChange={(e) => setPONumber(e.target.value || undefined)}
            className="w-full border rounded px-3 py-2"
          />
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
