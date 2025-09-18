import { assetTypeOptions, BarangKeluarFilter } from '@/types/AssetValues';
import React, { useEffect, useState } from 'react'; 
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import SelectField from '@/components/SelectField';
import { MJSUAPI } from '@/api';
import { Department, EmployeeHomeFormValues } from '@/types/EmployeeValues';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

interface FilterFormProps {
  onApply: (filters: {
    employee_id?: string;
    department?: string;
    asset_type_id?: string; 
    tanggal? : string | Date | null; 
  }) => void;
  onReset: () => void;
} 

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {  
  const token = useSelector((state: RootState) => state.auth.user?.token); 
  const [employeeOptions, setEmployeeOptions] = useState<{ label: string; value: string }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ label: string; value: string }[]>([]);
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BarangKeluarFilter>({
    defaultValues: {
      employee_id: '',
      department: '',
      asset_type_id: '',
      tanggal : null, 
    },
  });

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
 

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [empRes] = await Promise.all([
          MJSUAPI({
            url: '/employee/list/export/2',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),  
        ]);
        
        // Langsung ambil dari response
      const employeeOptions = empRes.data.map((emp: EmployeeHomeFormValues) => ({
        label: emp.lastname === "-" 
          ? emp.firstname 
          : `${emp.firstname} ${emp.lastname}`,
        value: emp.ID.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setEmployeeOptions(employeeOptions);
      
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]); 

   useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [deptRes] = await Promise.all([
          MJSUAPI({
            url: '/master/list/department',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),  
        ]);
        
        // Langsung ambil dari response
      const departmentOptions = deptRes.data.map((dept: Department) => ({
        label: dept.department_name,
        value: dept.ID.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setDepartmentOptions(departmentOptions);
      
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]); 

  
  const onSubmit = (data: BarangKeluarFilter) => { 
    onApply({
      employee_id: data.employee_id,
      department: data.department,
      asset_type_id: data.asset_type_id,
      tanggal: data.tanggal ? formatToLocalTime(data.tanggal.toISOString()) : '', 
    });
    reset(); // optional: clear form
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Barang Keluar</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> 
          <SelectField
            label="Karyawan"
            {...register('employee_id')}
            value={watch('employee_id') ?? ''}
            onChange={(e) => setValue('employee_id', e.target.value)}
            options={employeeOptions}
          /> 
          <SelectField
            label="Department"
            {...register('department')}
            value={watch('department') ?? ''}
            onChange={(e) => setValue('department', e.target.value)}
            options={departmentOptions}
          /> 
          <SelectField
            label="Jenis Asset"
            {...register('asset_type_id')}
            value={watch('asset_type_id') ?? ''}
            onChange={(e) => setValue('asset_type_id', e.target.value)}
            options={assetTypeOptions}
          /> 
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="tanggal"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.tanggal ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal"
                  />
                )}
              />
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
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Terapkan
          </button>
        </div>
    </form>
    </>
  );
};

export default FilterForm;
