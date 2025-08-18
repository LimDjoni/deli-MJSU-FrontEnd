'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader'; 
import SelectField from '@/components/SelectField';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import FilterModal from '@/components/Modal';
import EditForm from '@/components/EditForm';  
import { BackLog } from '@/types/BackLogValues';
import { Unit } from '@/types/FuelRatioValues';
import { componentOptions, Option, partDescriptionOptions, statOptions } from '@/types/OptionsValue';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import CommaDecimalInput from '@/components/CommaDecimalInput';
import TextAreaField from '@/components/TextAreaField';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EditDataAlatBeratForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const [hmBreakdownRaw, setHMBreakdownRaw] = useState<string | undefined>(); // store raw user input
  const [hmReadyRaw, setHMReadyRaw] = useState<string | undefined>(); // store raw user input
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { register, handleSubmit, setValue, setError, watch, control, formState: { errors } } = useForm<BackLog>({
    mode: 'onSubmit',
    defaultValues: { 
    unit_id: 0,
    hm_breakdown: 0,
    problem: '',
    component: '',
    part_number: '',
    part_description: '',
    qty_order: 0,
    date_of_inspection: null, 
    plan_replace_repair: null,
    hm_ready: 0,
    pp_number: '',
    po_number: '',
    status: '', 
    },
  });

  const roleString = String(role); // convert to number if it’s a string
  const statusOption =
    roleString === "Non Staff" ?  [statOptions[0]] : statOptions; // staff only gets first option
 
  const submitFormRef = useRef<(() => void) | null>(null);
 
  const [unitOptions, setUnitOptions] = useState<Option[]>([]);
  const [unitDetail, setUnitDetail] = useState<string>('');  
 
  // Initial brand, equipment, series for prefill
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [unitRes, detailRes] = await Promise.all([
          MrpAPI({ url: '/unit/list', method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          MrpAPI({ url: `/backlog/detail/${id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const units = unitRes.data;
        const detail = detailRes.data;

        setUnitOptions(units.map((b: Unit) => ({ label: b.unit_name, value: String(b.ID) })));

        if (detail) {
          const { unit_id, hm_breakdown, problem, component, part_number, part_description, qty_order, date_of_inspection, plan_replace_repair, hm_ready, pp_number, po_number, status } = detail;

          // ✅ Set form values
          setValue('unit_id', unit_id);
          setValue('hm_breakdown', hm_breakdown);
          setValue('problem', problem);
          setValue('component', component);
          setValue('part_number', part_number);
          setValue('part_description', part_description);
          setValue('qty_order', qty_order);
          setValue('date_of_inspection', date_of_inspection);
          setValue('plan_replace_repair', plan_replace_repair);
          setValue('hm_ready', hm_ready);
          setValue('pp_number', pp_number);
          setValue('po_number', po_number);
          setValue('status', status);
          setHMBreakdownRaw(hm_breakdown?.toString().replace('.', ',') || '');
          setHMReadyRaw(hm_ready?.toString().replace('.', ',') || '');
           
          // ✅ Fetch unit options
          const [unitDetailRes] = await Promise.all([
            MrpAPI({ url: `/unit/detail/${unit_id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }), 
          ]);

          console.log(unitDetailRes);
          setUnitDetail(`${unitDetailRes.data.brand.brand_name} ${unitDetailRes.data.series.series_name}`);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token, id, setValue]);

  const unitId = watch('unit_id');
  useEffect(() => { 
    if (!unitId) {
      setUnitDetail(''); 
      return;
    }
    
    const fetchUnitDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/unit/detail/${unitId}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
        }); 
        
        setUnitDetail(`${data.brand.brand_name} ${data.series.series_name}`);
      } catch (error) {
        console.error("Failed to fetch unit name:", error);
      }
    };

    fetchUnitDetail();
  }, [unitId, token]);
 
  const formatToLocal = (isoString: Date | null | undefined) => {
    if (!isoString) return null;

    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const onSubmit = async (values: BackLog) => {
    let hasError = false;

    if (isNaN(values.unit_id) || values.unit_id <= 0) {
      setError("unit_id", { type: "manual", message: "unit wajib dipilih" });
      hasError = true;
    }

    if (isNaN(values.hm_breakdown) || values.hm_breakdown <= 0) {
      setError("hm_breakdown", { type: "manual", message: "HM Breakdown wajib dipilih" });
      hasError = true;
    }  

    if (!values.problem || values.problem.trim() === '') {  
      setError("problem", {type: "manual", message: "Problem Description wajib diisi"});
      hasError = true;
    } 

    if (!values.component || values.component.trim() === '') {  
      setError("component", {type: "manual", message: "Component wajib diisi"});
      hasError = true;
    } 

    if (!values.part_number || values.part_number.trim() === '') {  
      setError("part_number", {type: "manual", message: "Part Number wajib diisi"});
      hasError = true;
    } 

    if (!values.part_description || values.part_description.trim() === '') {  
      setError("part_description", {type: "manual", message: "Part Description wajib diisi"});
      hasError = true;
    }    
    
    if (isNaN(values.qty_order) || values.qty_order <= 0) {
      setError("qty_order", { type: "manual", message: "Qty Order wajib diisi" });
      hasError = true;
    } 
    
    if (!values.date_of_inspection) {  
      setError("date_of_inspection", {type: "manual", message: "Date of Inspection wajib diisi"});
      hasError = true;
    }    

    if (!values.plan_replace_repair) {  
      setError("plan_replace_repair", {type: "manual", message: "Date of Inspection wajib diisi"});
      hasError = true;
    }    

    if (!values.status || values.status.trim() === '') {  
      setError("status", {type: "manual", message: "Status wajib diisi"});
      hasError = true;
    }     

    if (hasError) return;
    try {
      await MrpAPI({
        url: `/backlog/update/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: {
            ...values,
            date_of_inspection: values.date_of_inspection 
            ? formatToLocal(values.date_of_inspection as Date) 
            : null, 
            plan_replace_repair: values.plan_replace_repair 
            ? formatToLocal(values.plan_replace_repair as Date) 
            : null, 
          },
      });

      router.push('/backlog');
    } catch (error) {
      console.error('Update failed:', error);
    }
  }; 
  
  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Alat Berat" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/backlog/detail/${id}`)}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Unit"
          {...register('unit_id', { required: 'Unit wajib diisi', valueAsNumber: true })}
          value={watch('unit_id')}
          onChange={(e) => { 
            setValue('unit_id', Number(e.target.value));
          }}
          options={unitOptions}
          error={errors.unit_id?.message}
        />
        <InputFieldsLabel
          label="Unit EGI :"
          value={unitDetail}
          disabled
        />
        <CommaDecimalInput<BackLog>
              name="hm_breakdown"
              label="HM Breakdown"
              control={control}
              error={errors.hm_breakdown}
              rawValue={hmBreakdownRaw ?? ''} // ✅ fallback to empty string
              setRawValue={setHMBreakdownRaw}
            />
          <TextAreaField
            label="Problem Description"
            value={watch('problem') ?? ''}
            onChange={(e) => setValue('problem', e.target.value)}
            placeholder="Input Problem Description"
            error={errors.problem?.message} 
          />
          <SelectField
            label="Component"
            {...register('component')}
            value={watch('component')}
            onChange={(e) => setValue('component', e.target.value)}
            options={componentOptions}
            error={errors.component?.message}
          />
          <InputFieldsLabel
            label="Part Number :"
            type="text"
            {...register('part_number', {
              required: 'Part Number wajib diisi',
            })}
            error={errors.part_number?.message}
          />
          <SelectField
            label="Part Description"
            {...register('part_description')}
            value={watch('part_description')}
            onChange={(e) => setValue('part_description', e.target.value)}
            options={partDescriptionOptions}
            error={errors.part_description?.message}
          />  
          <InputFieldsLabel
            label="Qty Order :"
            type="number"
            {...register('qty_order', {
              required: 'Qty Order wajib diisi',
              valueAsNumber: true,
              min: { value: 0, message: 'Nilai tidak boleh negatif' },
            })}
            error={errors.qty_order?.message}
          />
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Date of Inspection :</label>
            <div className="w-75 col-span-2 flex flex-col gap-1">
              <Controller
                control={control}
                name="date_of_inspection" 
                render={({ field: { onChange, value, ref } }) => (
                  <DatePicker
                    selected={value as Date}
                    onChange={onChange}
                    dateFormat="yyyy-MM-dd"
                    className="w-75 border rounded px-3 py-2"
                    placeholderText="Pilih Date of Inspection"
                    minDate={new Date("2024-01-01")}
                    ref={ref}
                  />
                )}
              />
              {errors.date_of_inspection && (
                <span className="text-sm text-red-500">{errors.date_of_inspection.message}</span>
              )}
            </div>
          </div> 
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Plan Replace and Repair Date :</label>
            <div className="w-75 col-span-2 flex flex-col gap-1">
              <Controller
                control={control}
                name="plan_replace_repair" 
                render={({ field: { onChange, value, ref } }) => (
                  <DatePicker
                    selected={value as Date}
                    onChange={onChange}
                    dateFormat="yyyy-MM-dd"
                    className="w-75 border rounded px-3 py-2"
                    placeholderText="Pilih Plan Replace and Repair Date"
                    minDate={new Date("2024-01-01")}
                    ref={ref}
                  />
                )}
              />
              {errors.plan_replace_repair && (
                <span className="text-sm text-red-500">{errors.plan_replace_repair.message}</span>
              )}
            </div>
          </div> 
          <CommaDecimalInput<BackLog>
              name="hm_ready"
              label="HM Ready"
              control={control}
              rawValue={hmReadyRaw ?? '0'}
              setRawValue={setHMReadyRaw}
            />
          <InputFieldsLabel
            label="PP Number :"
            type="text"
            {...register('pp_number')}
            error={errors.pp_number?.message}
          />
          <InputFieldsLabel
            label="PO Number :"
            type="text"
            {...register('po_number')}
            error={errors.po_number?.message}
          />
          <SelectField
            label="Status"
            {...register('status', {
              required: 'Status wajib dipilih',
            })}
            value={watch('status')}
            onChange={(e) => setValue('status', e.target.value)}
            options={statusOption}
            error={errors.status?.message}
          /> 
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
