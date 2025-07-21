'use client';

import { useEffect, useState } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import SelectField from '@/components/SelectField';
import { MrpAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { Controller, useForm } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorMessage from '@/components/ErrorMessage';

interface Unit {
  ID: number;
  unit_name: string;
}

type Option = {
  label: string;
  value: string;
};

type Employee = {
  ID: string;
  firstname: string;
  lastname: string;
};
 
interface FuelRatio { 
  ID: number;
  unit_name: string;
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number;
  consumption?: number;
  brand: {
    brand_name: string;
  };
  heavy_equipment: {
    heavy_equipment_name: string;
  };
  series: {
    series_name: string;
  }; 
}

type FuelRatioValues = {
  unit_id: number;
  employee_id: number;
  shift: string;
  brand_id: number;
  heavy_equipment_id: number; 
  series_id: number; 
  consumption: number;
  tolerance: number;
  first_hm: Date | null;
};

export default function TambahDataFuelRatioForm() { 
  const [employees, setEmployees] = useState<{ label: string; value: string }[]>([]);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [unitList, setUnitList] = useState<FuelRatio[]>([]);
  const [unitSelectOptions, setUnitSelectOptions] = useState<Option[]>([]);

  const {
  register,
  handleSubmit,
  control, 
  watch,
  setError,
  setValue,
  formState: { errors },
} = useForm<FuelRatioValues>({
  mode: 'onSubmit',
  defaultValues: {
    unit_id: 0,
    employee_id: 0,
    shift: '',
    brand_id: 0,
    heavy_equipment_id: 0,
    series_id: 0,
    consumption: 0,
    tolerance: 0,
    first_hm: new Date(), 
  },
}); 

  const shiftOptions = [
    { label: 'Shift 1', value: 'Shift 1' },
    { label: 'Shift 2', value: 'Shift 2' },
  ];

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const onSubmit = async (dataFuelRatio: FuelRatioValues) => {  
    let hasError = false;
 
    if (isNaN(dataFuelRatio.unit_id) || dataFuelRatio.unit_id <= 0) {
      setError("unit_id", { type: "manual", message: "Unit wajib diisi" });
      hasError = true;
    }

    if (isNaN(dataFuelRatio.employee_id) || dataFuelRatio.employee_id <= 0) {
      setError("employee_id", {type: "manual", message: "Operator wajib diisi"});
      hasError = true;
    }
  
    if (!dataFuelRatio.shift || dataFuelRatio.shift.trim() === '') {  
      setError("shift", {type: "manual", message: "Shift wajib diisi"});
      hasError = true;
    } 

    if (hasError) return; 
      try { 
        const formattedData = {
          ...dataFuelRatio,
          first_hm: formatToLocalTime(dataFuelRatio.first_hm?.toISOString() || ''),
        };
        const data  = await MrpAPI({
          url: "/fuelratio/create",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
          data: {
            ...formattedData,
          },
        });    
        console.log(data);
        router.push("/transaction/fuel-ratio");
      } catch {
        setError("root.serverError", {
          type: "manual",
          message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
        });
      }
    }; 
 

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [unitResponse, employeeResponse] = await Promise.all([
          MrpAPI({
            url: "/unit/list",
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),
          MrpAPI({
            url: '/employee/department/1',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUnitList(unitResponse.data);

        const unitOpts: Option[] = unitResponse.data.map((unit: Unit) => ({
          label: unit.unit_name,
          value: String(unit.ID),
        }));

        setUnitSelectOptions(unitOpts);

        const options = employeeResponse.data.map((employee : Employee) => ({
          value: employee.ID,
          label: `${employee.firstname} ${employee.lastname}`.trim(),
        }));

        setEmployees(options); 

      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  const unitId = watch('unit_id');

  useEffect(() => {
    if (!unitId) return;

    const selectedUnit = unitList.find(u => u.ID === unitId);
    if (!selectedUnit) return;

    // Auto-fill static values
    setValue('brand_id', selectedUnit.brand_id);
    setValue('heavy_equipment_id', selectedUnit.heavy_equipment_id);
    setValue('series_id', selectedUnit.series_id);

    let isMounted = true; // control flag

    const fetchConsumption = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/alatberat/consumption/${selectedUnit.brand_id}/${selectedUnit.heavy_equipment_id}/${selectedUnit.series_id}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
          },
        });

        if (isMounted && typeof data?.consumption === 'number') {
          setValue('consumption', data.consumption);
        }
      } catch (error) {
        console.error("Failed to fetch consumption:", error);
      }
    };

    fetchConsumption(); 
    return () => {
      isMounted = false;
    };
  }, [unitId, unitList, setValue, token]);
 
  return (
    <>
    <div className="relative mx-auto"> 
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Fuel Ratio" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button"  
            onClick={() => router.push('/transaction/fuel-ratio/')}
            className="px-6">
              Kembali
            </ButtonDisabled> 
            <ButtonAction type="submit" className="px-6">
            Simpan
          </ButtonAction>
          </div>
        </div> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: 4 stacked fields */}
          <div className="space-y-4">
            <div>
              <SelectField
                label="Nama Unit"
                {...register('unit_id', {
                  required: 'Unit wajib diisi',
                  valueAsNumber: true,
                })}
                value={watch('unit_id')}
                onChange={(e) => setValue('unit_id', Number(e.target.value))}
                options={unitSelectOptions}
                error={errors.unit_id?.message}
              />
            </div>
            <div>
              <SelectField
                label="Operator"
                {...register('employee_id', { required: 'Operator wajib diisi', valueAsNumber: true })}
                value={watch('employee_id')}
                onChange={(e) => setValue('employee_id', Number(e.target.value))}
                options={employees}
                error={errors.employee_id?.message}
              />
            </div>
            <div>
              <SelectField
                label="Shift"
                {...register('shift')}
                value={watch('shift')}
                onChange={(e) => setValue('shift', e.target.value)}
                options={shiftOptions}
                error={errors.shift?.message}
              />
            </div>
            <div className="col-span-3 grid grid-cols-3 items-start gap-4">
              <label className="text-left font-medium pt-2">HM Awal :</label>
              <Controller
                control={control}
                name="first_hm"
                rules={{ required: "HM Awal wajib diisi" }}
                render={({ field: { onChange, value, ref } }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    className="w-75 border rounded px-3 py-2"
                    placeholderText="Pilih Tanggal & Waktu"
                    minDate={new Date("2024-01-01")}
                    ref={ref}
                  />
                )}
              />

              <ErrorMessage>{errors.first_hm?.message}</ErrorMessage>
            </div>
          </div>

          {/* Right column: 4 stacked fields */}
          <div className="space-y-4">
            <div>
              <InputFieldsLabel
                label="Brand :"
                value={unitList.find(u => u.ID === unitId)?.brand.brand_name || ''}
                disabled
              />
            </div>
            <div>
              <InputFieldsLabel
                label="Jenis Alat Berat :"
                value={unitList.find(u => u.ID === unitId)?.heavy_equipment.heavy_equipment_name || ''}
                disabled
              /> 
          </div>
            <div>
              <InputFieldsLabel
                label="Seri Alat Berat :"
                value={unitList.find(u => u.ID === unitId)?.series.series_name || ''}
                disabled
              />  
            </div>
            <div>
              <InputFieldsLabel
                label="Konsumsi BBM Dalam 1 Jam (L) :"
                value={watch('consumption') ?? 0}
                disabled
              />   
            </div>
          </div>
        </div> 
      </form>
    </div>
    </>
  );
}
