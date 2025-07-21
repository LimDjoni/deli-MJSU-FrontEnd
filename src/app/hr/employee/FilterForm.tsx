import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MrpAPI } from '@/api';
import { Department } from '@/types/EmployeeValues';

interface FilterFormProps {
  onApply: (filters: {
    nomor_karyawan?: string;
    department_id?: number;
    firstname?: string;
    phone_number?: string;
    email?: string;
    level?: string;
  }) => void;
  onReset: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [selectednomorKaryawan, setNomorKaryawan] = useState<string>('');
  const [selectedEmployeeName, setEmployeeName] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectednomorTelpon, setNomorTelpon] = useState<string>('');
  const [selectedEmail, setEmail] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentRes] = await Promise.all([
          MrpAPI({
            url: '/master/list/department',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
        ]);

        setDepartments(departmentRes.data); 
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const handleReset = () => {
    setNomorKaryawan('');
    setEmployeeName('');
    setSelectedLevel('');
    setNomorTelpon('');
    setSelectedDepartment(0);
    setEmail('');
    onReset();
  };

  const handleApply = () => {
    const selectedDepartments = departments.find(
      (eq) => eq.ID === selectedDepartment
    )?.ID;
    
    onApply({
      nomor_karyawan: selectednomorKaryawan,
      firstname: selectedEmployeeName,
      department_id: selectedDepartments,
      phone_number: selectednomorTelpon,
      email: selectedEmail,
      level: selectedLevel,
    });
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Employee</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Nomor Karyawan</label>
          <input
            type="text"
            value={selectednomorKaryawan}
            onChange={(e) => setNomorKaryawan(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Nomor Karyawan"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nama Karyawan</label>
          <input
            type="text"
            value={selectedEmployeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Nama Karyawan"
          />
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedDepartment ?? ''}
            onChange={(e) =>
              setSelectedDepartment(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Department</option>
            {departments.map((b) => (
              <option key={b.ID} value={b.ID}>
                {b.department_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nomor Telpon</label>
          <input
            type="text"
            value={selectednomorTelpon}
            onChange={(e) => setNomorTelpon(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Nomor Telpon"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="text"
            value={selectedEmail}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan Email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Level</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">Pilih Level</option>
            <option value="Admin">Admin</option>
            <option value="Operasional">Operasional</option>
            <option value="Pengawas">Pengawas</option>
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
