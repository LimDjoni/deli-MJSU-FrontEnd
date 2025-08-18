'use client';

import { useEffect, useState } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import SelectField from '@/components/SelectField';
import { MrpAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux'; 
import { Controller, useForm } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import { BackLog } from '@/types/BackLogValues';
import { Unit, UnitValues } from '@/types/FuelRatioValues';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import CommaDecimalInput from '@/components/CommaDecimalInput';
import TextAreaField from '@/components/TextAreaField';
import { componentOptions, partDescriptionOptions, statOptions } from '@/types/OptionsValue';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function TambahDataAlatBeratForm() {
  const [unitOptions, setUnitOptions] = useState<{ label: string; value: string }[]>([]); 
  const [unitDetail, setUnitDetail] = useState<UnitValues | null>(null);
  const [hmBreakdownRaw, setHMBreakdownRaw] = useState('0'); // store raw user input 
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const router = useRouter();

  const {
  register,
  handleSubmit,
  watch,
  setError,
  setValue,
  control,
  formState: { errors },
} = useForm<BackLog>({
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
    hm_ready: 0,
    status: '', 
  },
});
 
  const roleString = String(role); // convert to number if it’s a string
  const statusOption =
    roleString === "Non Staff" ?  [statOptions[0]] : statOptions; // staff only gets first option

  const formatToLocal = (isoString: Date | null | undefined) => {
    if (!isoString || isNaN(isoString.getTime())) return null;

    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const onSubmit = async (dataBackLog: BackLog) => {  
    let hasError = false;

    if (isNaN(dataBackLog.unit_id) || dataBackLog.unit_id <= 0) {
      setError("unit_id", { type: "manual", message: "unit wajib dipilih" });
      hasError = true;
    }

    if (isNaN(dataBackLog.hm_breakdown) || dataBackLog.hm_breakdown <= 0) {
      setError("hm_breakdown", { type: "manual", message: "HM Breakdown wajib dipilih" });
      hasError = true;
    }  
    
    if (isNaN(dataBackLog.qty_order) || dataBackLog.qty_order <= 0) {
      setError("qty_order", { type: "manual", message: "Qty Order wajib diisi" });
      hasError = true;
    } 
    
    if (!dataBackLog.problem || dataBackLog.problem.trim() === '') {  
      setError("problem", {type: "manual", message: "Problem Description wajib diisi"});
      hasError = true;
    } 

    if (!dataBackLog.component || dataBackLog.component.trim() === '') {  
      setError("component", {type: "manual", message: "Component wajib diisi"});
      hasError = true;
    } 

    if (!dataBackLog.part_number || dataBackLog.part_number.trim() === '') {  
      setError("part_number", {type: "manual", message: "Part Number wajib diisi"});
      hasError = true;
    } 

    if (!dataBackLog.part_description || dataBackLog.part_description.trim() === '') {  
      setError("part_description", {type: "manual", message: "Part Description wajib diisi"});
      hasError = true;
    }    

    if (!dataBackLog.status || dataBackLog.status.trim() === '') {  
      setError("status", {type: "manual", message: "Status wajib diisi"});
      hasError = true;
    }     

    if (hasError) return;

      try { 
        const data  = await MrpAPI({
          url: "/backlog/create/",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
          data: {
            ...dataBackLog,
            date_of_inspection: dataBackLog.date_of_inspection 
            ? formatToLocal(dataBackLog.date_of_inspection as Date) 
            : null,  
            hm_ready: 0,
          },
        });    
        console.log(data)

        router.push("/backlog/");
      } catch {
        setError("root.serverError", {
          type: "manual",
          message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
        });
      }
    }; 

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const { data } = await MrpAPI({
          url: "/unit/list/",
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
        }); 

      const mappedOptions = data.map((unit: Unit) => ({
        label: unit.unit_name,
        value: String(unit.ID),
      }));

        setUnitOptions(mappedOptions);
      } catch (error) {
        console.error("Failed to fetch units:", error);
      }
    };

    fetchUnits();
  }, [token]);


  const unitId = watch('unit_id');
  useEffect(() => { 
    if (!unitId) {
      setUnitDetail(null); // kosongkan kalau belum ada unit dipilih
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
        
        setUnitDetail(data);
      } catch (error) {
        console.error("Failed to fetch unit name:", error);
      }
    };

    fetchUnitDetail();
  }, [unitId, token]);
  
  return (
    <>
    <div className="relative mx-auto"> 
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Backlog" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/backlog/')}
            className="px-6">
              Kembali
            </ButtonDisabled> 
            <ButtonAction type="submit" className="px-6">
            Simpan
          </ButtonAction>
          </div>
        </div> 

        <div className="grid grid-cols-3 items-center gap-4">
          <SelectField
              label="Unit"
              {...register('unit_id', { required: 'Unit wajib diisi', valueAsNumber: true })}
              value={watch('unit_id')}
              onChange={(e) => setValue('unit_id', Number(e.target.value))}
              options={unitOptions}
              error={errors.unit_id?.message}
            /> 
          <InputFieldsLabel
              label="Unit EGI :"
              value={`${unitDetail?.brand?.brand_name || ''} ${unitDetail?.series?.series_name || ''}`.trim()}
              disabled
            />
          <CommaDecimalInput<BackLog>
              name="hm_breakdown"
              label="HM Breakdown"
              control={control}
              error={errors.hm_breakdown}
              rawValue={hmBreakdownRaw}
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
    </div>
    </>
  );
}
