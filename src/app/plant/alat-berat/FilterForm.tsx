import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MrpAPI } from '@/api';

interface FilterFormProps {
  onApply: (filters: {
    brand_id?: number;
    heavy_equipment_name?: string;
    series_name?: string;
    consumption?: number;
    tolerance?: number; 
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

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<number | undefined>(undefined);
  const [selectedEquipment, setSelectedEquipment] = useState<number | undefined>(undefined);
  const [selectedSeries, setSelectedSeries] = useState<number | undefined>(undefined);

  const [consumption, setConsumption] = useState<number>(0);
  const [tolerance, setTolerance] = useState<number>(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [brandRes, equipmentRes, seriesRes] = await Promise.all([
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
    setSelectedBrand(undefined);
    setSelectedEquipment(undefined);
    setSelectedSeries(undefined);
    setConsumption(0);
    setTolerance(0);
    onReset(); // Notify parent to reset filtered data
  };

  const handleApply = () => {
    const selectedEquipmentName = equipments.find(
      (eq) => eq.ID === selectedEquipment
    )?.heavy_equipment_name;

    const selectedSeriesName = seriesList.find(
      (eq) => eq.ID === selectedSeries
    )?.series_name;

    onApply({
      brand_id: selectedBrand,
      heavy_equipment_name: selectedEquipmentName || '',
      series_name: selectedSeriesName,
      consumption,
      tolerance,
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Alat Berat</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

        <div>
          <label className="block text-sm font-medium mb-1">Konsumsi BBM /h</label>
          <input
            type="number"
            value={consumption}
            onChange={(e) => setConsumption(Number(e.target.value) || 0)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Persentase Toleransi (%)</label>
          <input
            type="number"
            value={tolerance}
            onChange={(e) => setTolerance(Number(e.target.value) || 0)}
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
