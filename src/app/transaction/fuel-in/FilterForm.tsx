import React, { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { codeOptions, tujuanAwalOptions, vendorOptions } from '@/types/OptionsValue';

interface FilterFormProps {
  onApply: (filters: {
      vendor: string,
      code: string,
      nomor_surat_jalan: string,
      nomor_plat_mobil: string,
      qty: string,
      qty_now: string,
      driver: string,
      tujuan_awal: string,
  }) => void;
  onReset: () => void;
}  

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const [selectedVendor, setVendor] = useState<string>('');
  const [selectedCode, setCode] = useState<string>('');
  const [selectedSuratJalan, setSuratJalan] = useState<string>('');
  const [selectedNomorMobil, setNomorMobil] = useState<string>('');
  const [selectedDriver, setDriver] = useState<string>('');
  const [selectedTujuanAwal, setTujuanAwal] = useState<string>('');
 

  const handleReset = () => {
    setVendor('');
    setCode('');
    setSuratJalan('');
    setNomorMobil('');
    setDriver('');
    onReset();
  };

  const handleApply = () => {
    onApply({ 
      vendor: selectedVendor || '',
      code: selectedCode || '',
      nomor_surat_jalan: selectedSuratJalan || '',
      nomor_plat_mobil: selectedNomorMobil || '',
      qty: '',
      qty_now: '',
      driver: selectedDriver || '',
      tujuan_awal: selectedTujuanAwal || '',
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Fuel In</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Vendor</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedVendor}
            onChange={(e) => setVendor(e.target.value)}
          >
            <option value="">Pilih Vendor</option>
            {vendorOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div>  
        <div>
          <label className="block text-sm font-medium mb-1">B35/40</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedCode}
            onChange={(e) => setCode(e.target.value)}
          >
            <option value="">Pilih Code</option>
            {codeOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Nomor Surat Jalan</label>
          <input
            type="text"
            value={selectedSuratJalan}
            onChange={(e) => setSuratJalan(e.target.value ?? '')}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Nomor Surat Jalan"
          />
        </div>   
        <div>
          <label className="block text-sm font-medium mb-1">Nomor Plat Mobil</label>
          <input
            type="text"
            value={selectedNomorMobil}
            onChange={(e) => setNomorMobil(e.target.value ?? '')}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Nomor Plat Mobil"
          />
        </div>      
        <div>
          <label className="block text-sm font-medium mb-1">Driver</label>
          <input
            type="text"
            value={selectedDriver}
            onChange={(e) => setDriver(e.target.value ?? '')}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Driver"
          />
        </div>  
        <div>
          <label className="block text-sm font-medium mb-1">Tujuan Awal</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedTujuanAwal}
            onChange={(e) => setTujuanAwal(e.target.value)}
          >
            <option value="">Pilih Tujuan Awal</option>
            {tujuanAwalOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
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
