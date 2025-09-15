import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MJSUAPI } from '@/api';
import { Department, Position, Role } from '@/types/EmployeeValues';
import { hireOptions, agamaOptions, genderOptions, LokalNonLokalOptions, kategoriLaporanTriwulanOptions, statusOptions, kontrakOptions } from '@/types/OptionsValue'; 

interface FilterFormProps {
  onApply: (filters: {
    nomor_karyawan?: string;
    department_id?: number;
    firstname?: string;
    hire_by?: string;
    agama?: string;
    level?: string;
    gender?: string;
    kategori_lokal_non_lokal?: string;
    kategori_triwulan?: string;
    status?: string;
    kontrak?: string;
    role_id?: number;
    position_id?: number;
  }) => void;
  onReset: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [selectednomorKaryawan, setNomorKaryawan] = useState<string>('');
  const [selectedEmployeeName, setEmployeeName] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedHireBy, setHireBy] = useState<string>('');
  const [selectedAgama, setAgama] = useState<string>('');
  const [selectedTriwulan, setTriwulan] = useState<string>('');
  const [selectedGender, setGender] = useState<string>('');
  const [selectedStatus, setStatus] = useState<string>('');
  const [selectedKontrak, setKontrak] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedLokalNonLokal, setKategoriLokalNonLokal] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);
  const [selectedRoles, setSelectedRoles] = useState<number | undefined>(undefined);
  const [selectedPositions, setSelectedPositions] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentRes, levelRes, positionRes] = await Promise.all([
          MJSUAPI({
            url: '/master/list/department',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
          MJSUAPI({
            url: '/master/list/role',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
          MJSUAPI({
            url: '/master/list/position',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
        ]);

        setDepartments(departmentRes.data); 
        setRoles(levelRes.data); 
        setPositions(positionRes.data); 
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
    setHireBy('');
    setSelectedDepartment(0);
    setSelectedRoles(0);
    setSelectedPositions(0);
    setAgama('');
    setGender('');
    setKategoriLokalNonLokal('');
    setTriwulan('');
    setStatus('');
    setKontrak('');
    onReset();
  };

  const handleApply = () => {
    const selectedDepartments = departments.find(
      (eq) => eq.ID === selectedDepartment
    )?.ID;
    
    const selectedRole = roles.find(
      (eq) => eq.ID === selectedRoles
    )?.ID;
    
    const selectedPosition = positions.find(
      (eq) => eq.ID === selectedPositions
    )?.ID;
    
    onApply({
      nomor_karyawan: selectednomorKaryawan,
      firstname: selectedEmployeeName,
      department_id: selectedDepartments,
      position_id: selectedPosition,
      hire_by: selectedHireBy,
      agama: selectedAgama,
      level: selectedLevel,
      gender: selectedGender,
      kategori_lokal_non_lokal: selectedLokalNonLokal,
      kategori_triwulan: selectedTriwulan,
      status: selectedStatus,
      kontrak: selectedKontrak,
      role_id: selectedRole,
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
          <label className="block text-sm font-medium mb-1">Level</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedRoles ?? ''}
            onChange={(e) =>
              setSelectedRoles(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Level</option>
            {roles.map((b) => (
              <option key={b.ID} value={b.ID}>
                {b.name}
              </option>
            ))}
          </select>
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
          <label className="block text-sm font-medium mb-1">Jabatan</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedPositions ?? ''}
            onChange={(e) =>
              setSelectedPositions(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value="">Pilih Jabatan</option>
            {positions.map((b) => (
              <option key={b.ID} value={b.ID}>
                {b.position_name}
              </option>
            ))}
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Kategori Triwulan</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedTriwulan}
            onChange={(e) => setTriwulan(e.target.value)}
          >
            <option value="">Pilih Kategori Triwulan</option>
            {kategoriLaporanTriwulanOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Kategori Statistik K3</label>
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
        <div>
          <label className="block text-sm font-medium mb-1">Kategori Lokal/Non Lokal</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedLokalNonLokal}
            onChange={(e) => setKategoriLokalNonLokal(e.target.value)}
          >
            <option value="">Pilih Kategori Lokal/Non Lokal</option>
            {LokalNonLokalOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Hire By</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedHireBy}
            onChange={(e) => setHireBy(e.target.value)}
          >
            <option value="">Pilih Hire By</option>
            {hireOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Agama</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedAgama}
            onChange={(e) => setAgama(e.target.value)}
          >
            <option value="">Pilih Agama</option>
            {agamaOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedGender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Pilih Gender</option>
            {genderOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedStatus}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Pilih Status</option>
            {statusOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))} 
          </select>
        </div> 
        <div>
          <label className="block text-sm font-medium mb-1">Kontrak</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedKontrak}
            onChange={(e) => setKontrak(e.target.value)}
          >
            <option value="">Pilih Status</option>
            {kontrakOptions.map((b) => (
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
