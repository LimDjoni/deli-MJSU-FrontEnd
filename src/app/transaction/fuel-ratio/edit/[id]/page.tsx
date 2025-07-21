'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import SelectField from '@/components/SelectField';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import FilterModal from '@/components/Modal';
import EditForm from '@/components/EditForm';
import ErrorMessage from '@/components/ErrorMessage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


interface Unit {
  ID: number;
  unit_name: string;
}

type Option = {
  label: string;
  value: string;
};
 
interface Employee {
  ID: number;
  firstname: string;
  lastname: string;
}

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
  total_refill: number;
  first_hm: Date | null;
  last_hm: Date | null;
};

export default function EditDataFuelRatioForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { register, handleSubmit, control, setValue, setError, watch, formState: { errors } } = useForm<FuelRatioValues>({
    mode: 'onSubmit',
    defaultValues: {
      unit_id: 0,
      employee_id: 0,
      shift: '',
      brand_id: 0,
      heavy_equipment_id: 0,
      series_id: 0,
      consumption: 0, 
      first_hm: new Date(), 
      last_hm: null, 
      total_refill: 0,
    },
}); 
  const [unitList, setUnitList] = useState<FuelRatio[]>([]);
  const [unitSelectOptions, setUnitSelectOptions] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const shiftOptions = [
    { label: 'Shift 1', value: 'Shift 1' },
    { label: 'Shift 2', value: 'Shift 2' }
  ];
  
  const submitFormRef = useRef<(() => void) | null>(null);
 
  const didPrefill = useRef(false); // Add this above useEffect
 
  const unitId = watch('unit_id');
  const selectedUnit = unitList.find(u => u.ID === unitId); 

  useEffect(() => {
  const fetchInitialLists = async () => {
    try {
      const [unitRes, employeeRes] = await Promise.all([
        MrpAPI({ url: '/unit/list', method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        MrpAPI({ url: '/employee/department/1', method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const unitOpts = unitRes.data.map((u: Unit) => ({ label: u.unit_name, value: String(u.ID) }));
      const employeeOpts = employeeRes.data.map((o: Employee) => ({
        label: `${o.firstname} ${o.lastname}`.trim(),
        value: String(o.ID),
      }));

      setUnitList(unitRes.data);
      setUnitSelectOptions(unitOpts);
      setEmployees(employeeOpts);
    } catch (error) {
      console.error('Failed to fetch unit/employee list', error);
    }
  };

  if (token) fetchInitialLists();
}, [token]);


  // Initial brand, equipment, series for prefill
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [detailRes] = await Promise.all([
          MrpAPI({ url: `/fuelratio/detail/${id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const detail = detailRes.data; 

        if (detail) {
          const { unit_id, employee_id, shift, brand_id, heavy_equipment_id, series_id, first_hm, last_hm, total_refill } = detail;

          // ✅ Set form values
          setValue('unit_id', unit_id);
          setValue('employee_id', employee_id);
          setValue('shift', shift);
          setValue('brand_id', brand_id);
          setValue('heavy_equipment_id', heavy_equipment_id);
          setValue('series_id', series_id);
          setValue('first_hm', new Date(first_hm));
          setValue('last_hm', last_hm ? new Date(last_hm) : null);
          setValue('total_refill', total_refill); 
          
          // ✅ Avoid clearing on first render
          didPrefill.current = true;
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token, id, setValue]);

  useEffect(() => {
    if (!unitId) return;
    const selected = unitList.find(u => u.ID === unitId);
    if (!selected) return;

    setValue('brand_id', selected.brand_id);
    setValue('heavy_equipment_id', selected.heavy_equipment_id);
    setValue('series_id', selected.series_id);

    const fetchConsumption = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/alatberat/consumption/${selected.brand_id}/${selected.heavy_equipment_id}/${selected.series_id}`,
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (typeof data?.consumption === 'number') {
          setValue('consumption', data.consumption);
        }
      } catch (err) {
        console.error('Failed to fetch consumption:', err);
      }
    };

    fetchConsumption();
  }, [unitId, unitList, setValue, token]);

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const onSubmit = async (values: FuelRatioValues) => {
    let hasError = false;

    if (isNaN(values.unit_id) || values.unit_id <= 0) {
      setError("unit_id", { type: "manual", message: "Unit wajib diisi" });
      hasError = true;
    }

    if (isNaN(values.employee_id) || values.employee_id <= 0) {
      setError("employee_id", {type: "manual", message: "Operator wajib diisi"});
      hasError = true;
    }
  
    if (!values.shift || values.shift.trim() === '') {  
      setError("shift", {type: "manual", message: "Shift wajib diisi"});
      hasError = true;
    } 

    if (hasError) return;
    try {
      const formattedData = {
        ...values,
        first_hm: formatToLocalTime(values.first_hm?.toISOString() || ''),
        last_hm: formatToLocalTime(values.last_hm?.toISOString() || ''),
        status: !!values.last_hm, // ✅ logic here
      };
      await MrpAPI({
        url: `/fuelratio/update/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: formattedData,
      });

      router.push('/transaction/fuel-ratio');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  
  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Fuel Ratio" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/transaction/fuel-ratio/detail/${id}`)}
            className="px-6"
          >
            Kembali
          </ButtonDisabled>
          <ButtonAction
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="px-6"
            >
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
                options={unitSelectOptions} // ✅ inject here
                error={errors.unit_id?.message}
              />
            </div>
            <div>
              <SelectField
                label="Operator"
                {...register('employee_id', {
                  required: 'Operator wajib diisi',
                  valueAsNumber: true,
                })}
                value={watch('employee_id')}
                onChange={(e) => setValue('employee_id', Number(e.target.value))}
                options={employees} // ✅ inject here
                error={errors.employee_id?.message}
              />
            </div>
            <div>
              <SelectField
                label="Shift"
                {...register('shift')}
                value={watch('shift')}
                onChange={(e) => setValue('shift', e.target.value)}
                options={shiftOptions} // ✅ inject here
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
            <div className="col-span-3 grid grid-cols-3 items-start gap-4">
              <label className="text-left font-medium pt-2">HM Akhir :</label>
              <Controller
                control={control}
                name="last_hm"
                rules={{ required: "HM Akhir wajib diisi" }}
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
              <ErrorMessage>{errors.last_hm?.message}</ErrorMessage>
            </div>
            <InputFieldsLabel
              label="Jumlah Pengisian Fuel (L) :"
              type="number"
              {...register('total_refill', {
                required: 'Jumlah Pengisian Fuel wajib diisi',
                valueAsNumber: true,
                min: { value: 0, message: 'Nilai tidak boleh negatif' },
              })}
              error={errors.total_refill?.message}
            />
          </div>

          {/* Right column: 4 stacked fields */}
          <div className="space-y-4">
            <div>
              <InputFieldsLabel
                label="Brand :"
                value={selectedUnit?.brand?.brand_name || ''}
                disabled
              />
            </div>
            <div>
              <InputFieldsLabel
                label="Jenis Alat Berat :"
                value={selectedUnit?.heavy_equipment?.heavy_equipment_name || ''}
                disabled
              /> 
          </div>
            <div>
              <InputFieldsLabel
                label="Seri Alat Berat :"
                value={selectedUnit?.series?.series_name || ''}
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

     <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <EditForm
          onCancel={() => {  
            setIsFilterOpen(false);
          }}
          onConfirm={() => {  
            submitFormRef.current?.(); // submit form from outside
            setIsFilterOpen(false);
          }} 
        />
      </FilterModal>
    </>
  );
}
