import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MrpAPI } from '@/api';

interface FilterFormProps {
  onApply: (filters: {
    unit_name?: string;
    brand_id?: number;
    heavy_equipment_name?: string;
    series_name?: string; 
  }) => void;
  onReset: () => void;
}

type Brand = {
  ID: number;
  brand_name: string;
};

type Equipment = {
  ID: number;
  heavy_equipment_name: string;
};

type Series = {
  ID: number;
  series_name: string;
};

type Unit = {
  ID: number;
  unit_name: string;
};

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [unit, setUnit] = useState<Unit[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(undefined);
  const [selectedEquipment, setSelectedEquipment] = useState<number | undefined>(undefined);
  const [selectedSeries, setSelectedSeries] = useState<number | undefined>(undefined);
  const [selectedUnit, setSelectedUnit] = useState<number | undefined>(undefined);


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [unitRes, brandRes, equipmentRes, seriesRes] = await Promise.all([
          MrpAPI({
            url: '/unit/list',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),
          MrpAPI({
            url: '/master/list/brand',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),
          MrpAPI({
            url: '/master/list/heavyequipment',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),
          MrpAPI({
            url: '/master/list/series',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUnit(unitRes.data);
        setBrands(brandRes.data);
        setEquipments(equipmentRes.data);
        setSeriesList(seriesRes.data);
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const handleReset = () => {
    setSelectedUnit(undefined);
    setSelectedBrand(undefined);
    setSelectedEquipment(undefined);
    setSelectedSeries(undefined);
    onReset(); // Notify parent to reset filtered data
  };

  const handleApply = () => {
    const selectedUnitName = unit.find(
      (eq) => eq.ID === selectedUnit
    )?.unit_name;

    const selectedEquipmentName = equipments.find(
      (eq) => eq.ID === selectedEquipment
    )?.heavy_equipment_name;

    const selectedSeriesName = seriesList.find(
      (eq) => eq.ID === selectedSeries
    )?.series_name;

    onApply({
      unit_name: selectedUnitName || '',
      brand_id: selectedBrand,
      heavy_equipment_name: selectedEquipmentName || '',
      series_name: selectedSeriesName, 
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Unit</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        <div>
          <label className="block text-sm font-medium mb-1">Nama Unit</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedUnit ?? ''}
            onChange={(e) =>
              setSelectedUnit(e.target.value ? Number(e.target.value) : undefined)
            }
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
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedBrand ?? ''}
            onChange={(e) =>
              setSelectedBrand(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Brand</option>
            {brands.map((b) => (
              <option key={b.ID} value={b.ID}>
                {b.brand_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Jenis Alat Berat</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedEquipment ?? ''}
            onChange={(e) =>
              setSelectedEquipment(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Jenis Alat Berat</option>
            {equipments.map((eq) => (
              <option key={eq.ID} value={eq.ID}>
                {eq.heavy_equipment_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Seri Alat Berat</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedSeries ?? ''}
            onChange={(e) =>
              setSelectedSeries(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Seri Alat Berat</option>
            {seriesList.map((s) => (
              <option key={s.ID} value={s.ID}>
                {s.series_name}
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
