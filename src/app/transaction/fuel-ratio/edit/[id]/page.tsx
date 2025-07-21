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
import { FuelRatioValues, FuelRatio, Unit, Employee, Option } from '@/types/FuelRatioValues';
import CommaDecimalInput from '@/components/CommaDecimalInput';
  

export default function EditDataFuelRatioForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [firstHmRaw, setFirstHmRaw] = useState<string | undefined>();
  const [lastHmRaw, setlastHmRaw] = useState<string | undefined>();

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
      tolerance: 0,
      tanggal: null, 
      first_hm: 0,
      last_hm: 0,
      tanggal_awal: null, 
      tanggal_akhir: null, 
      total_refill:0,
    },
}); 
  const [unitList, setUnitList] = useState<FuelRatio[]>([]);
  const [unitSelectOptions, setUnitSelectOptions] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const unitId = watch('unit_id');

  const selectedUnit = unitList.find(u => u.ID === unitId);
  const equipmentName = selectedUnit?.heavy_equipment?.heavy_equipment_name || '';
  const isAllowed = equipmentName.toLowerCase() === 'water fill';

  // Final flag to control disabling other fields
  const isHeavyEquipmentValid = !!selectedUnit?.heavy_equipment_id && !isAllowed;

  const shiftOptions = [
    { label: 'Shift 1', value: 'Shift 1' },
    { label: 'Shift 2', value: 'Shift 2' }
  ];
  
  const submitFormRef = useRef<(() => void) | null>(null);
 
  const didPrefill = useRef(false); // Add this above useEffect
 

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
          const { unit_id, employee_id, shift, brand_id, heavy_equipment_id, series_id, tanggal, first_hm, last_hm, tanggal_awal, tanggal_akhir, total_refill } = detail;

          // ✅ Set form values
          setValue('unit_id', unit_id);
          setValue('employee_id', employee_id);
          setValue('shift', shift);
          setValue('brand_id', brand_id);
          setValue('heavy_equipment_id', heavy_equipment_id);
          setValue('series_id', series_id);
          setValue('tanggal', tanggal ? new Date(tanggal) : null);
          setValue('first_hm', first_hm);
          setValue('last_hm', last_hm);
          setValue('tanggal_awal', tanggal_awal ? new Date(tanggal_awal) : null);
          setValue('tanggal_akhir', tanggal_akhir ? new Date(tanggal_akhir) : null);
          setValue('total_refill', total_refill); 
          setFirstHmRaw(first_hm?.toString().replace('.', ',') || '');
          setlastHmRaw(last_hm?.toString().replace('.', ',') || '');
          
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
 
  const formatToLocal = (isoString: Date | null | undefined) => {
    if (!isoString || isNaN(isoString.getTime())) return null;

    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const formatToLocalTime = (dateInput: Date | null | undefined) => {
    if (!dateInput || isNaN(dateInput.getTime())) return null;

    const pad = (n: number) => String(n).padStart(2, '0');
    const date = new Date(dateInput);
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
    if (values.first_hm === null || values.first_hm === undefined || isNaN(values.first_hm) || values.first_hm <= 0) {
      setError("first_hm", { type: "manual", message: "HM Awal wajib diisi" });
      hasError = true;
    } 

    if (hasError) return;
    try {
        const status: boolean = 
          !!values.tanggal_akhir || (values.last_hm !== null && values.last_hm !== 0);

        const formattedData = {
          ...values,
          tanggal: values.tanggal 
            ? formatToLocal(values.tanggal) 
            : null, 
         tanggal_awal: values.tanggal_awal 
            ? formatToLocalTime(values.tanggal_awal) 
            : null,
         tanggal_akhir: values.tanggal_akhir 
            ? formatToLocalTime(values.tanggal_akhir) 
            : null, 
          status,
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
              <label className="text-left font-medium pt-2">Tanggal :</label>
              <Controller
                control={control}
                name="tanggal"
                  rules={
                    !isHeavyEquipmentValid
                      ? { required: "Tanggal wajib diisi" }
                      : undefined
                  }
                render={({ field: { onChange, value, ref } }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange} 
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd"
                    className="w-75 border rounded px-3 py-2"
                    placeholderText="Pilih Tanggal & Waktu"
                    minDate={new Date("2024-01-01")}
                    ref={ref}
                    disabled={!isHeavyEquipmentValid}
                  />
                )}
              /> 
              <ErrorMessage>{errors.tanggal?.message}</ErrorMessage>
            </div>
            <CommaDecimalInput<FuelRatioValues>
              name="first_hm"
              label="HM Awal:"
              control={control}
              error={errors.first_hm}
              disabled={!isHeavyEquipmentValid}
              rawValue={firstHmRaw ?? ''} // ✅ fallback to empty string
              setRawValue={setFirstHmRaw} 
            />
          <CommaDecimalInput<FuelRatioValues>
              name="last_hm"
              label="HM Akhir:"
              control={control}
              error={errors.last_hm}
              disabled={!isHeavyEquipmentValid}
              rawValue={lastHmRaw ?? ''} // ✅ fallback to empty string
              setRawValue={setlastHmRaw}
            /> 
            <div className="col-span-3 grid grid-cols-3 items-start gap-4">
              <label className="text-left font-medium pt-2">Tanggal dan Waktu Pengisian :</label>
              <div className="col-span-2 flex flex-col gap-1">
                <Controller
                  control={control}
                  name="tanggal_awal"
                  rules={
                    isAllowed
                      ? { required: "Tanggal dan Waktu Pengisian wajib diisi" }
                      : undefined
                  }
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
                      disabled={!isAllowed}
                    />
                  )}
                />
                {errors.tanggal_awal && (
                  <p className="text-red-500 text-sm">{errors.tanggal_awal.message}</p>
                )}
              </div>
            </div> 
            <div className="col-span-3 grid grid-cols-3 items-start gap-4">
              <label className="text-left font-medium pt-2">Tanggal dan Waktu Habis :</label>
              <div className="col-span-2 flex flex-col gap-1">
                <Controller
                  control={control}
                  name="tanggal_akhir"
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
                      disabled={!isAllowed}
                    />
                  )}
                />
                {errors.tanggal_akhir && (
                  <p className="text-red-500 text-sm">{errors.tanggal_akhir.message}</p>
                )}
              </div>
            </div> 
            <InputFieldsLabel
              label="Jumlah Pengisian Fuel (L) :"
              type="number"
              {...register('total_refill', {
                required: 'Jumlah Pengisian Fuel wajib diisi',
                valueAsNumber: true,
                min: { value: 0, message: 'Nilai tidak boleh negatif' },
              })}
              disabled={!isAllowed && !isHeavyEquipmentValid}
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
