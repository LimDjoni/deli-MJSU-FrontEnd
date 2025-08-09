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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FuelIn } from '@/types/FuelInValues';
import CommaDecimalInput from '@/components/CommaDecimalInput';
import { vendorOptions, codeOptions, tujuanAwalOptions } from '@/types/OptionsValue';
  

export default function EditDataFuelInForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [qtyRaw, setQtyRaw] = useState<string | undefined>();
  const [qtyNowRaw, setQtyNowRaw] = useState<string | undefined>();  
  const submitFormRef = useRef<(() => void) | null>(null);
  
  const { register, handleSubmit, control, setValue, setError, watch, formState: { errors } } = useForm<FuelIn>({
    mode: 'onSubmit',
    defaultValues: {
      date: '',
      vendor: '',
      code: '',
      nomor_surat_jalan: '',
      nomor_plat_mobil: '',
      qty: 0,
      qty_now: 0,
      driver: '',
      tujuan_awal: '',
    },
  });  

 // Initial brand, equipment, series for prefill
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [detailRes] = await Promise.all([
          MrpAPI({ url: `/fuelin/detail/${id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const detail = detailRes.data; 

        if (detail) {
          const { date, vendor, code, nomor_surat_jalan, nomor_plat_mobil, qty, qty_now, driver, tujuan_awal } = detail;

          // ✅ Set form values
          setValue('date', date ? new Date(date) : '');
          setValue('vendor', vendor);
          setValue('code', code);
          setValue('nomor_surat_jalan', nomor_surat_jalan);
          setValue('nomor_plat_mobil', nomor_plat_mobil); 
          setValue('driver', driver);
          setValue('tujuan_awal', tujuan_awal); 
          setValue('qty', qty ?? 0);
          setValue('qty_now', qty_now ?? 0);
          setQtyRaw(qty?.toString().replace('.', ',') || '');
          setQtyNowRaw(qty_now?.toString().replace('.', ',') || ''); 
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token, id, setValue]);

   const formatToLocal = (isoString: Date ) => { 
      const date = new Date(isoString);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    };  

  const onSubmit = async (values: FuelIn) => {
    let hasError = false;
 
    if (isNaN(values.qty) || values.qty <= 0) {
      setError("qty", { type: "manual", message: "Qty wajib diisi" });
      hasError = true;
    }

    if (isNaN(values.qty_now) || values.qty_now <= 0) {
      setError("qty_now", {type: "manual", message: "Qty Aktual wajib diisi"});
      hasError = true;
    } 

    if (hasError) return;
    try { 
        const formattedData = {
          ...values,
          date: formatToLocal(values.date as Date), 
        };
      await MrpAPI({
        url: `/fuelin/update/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: formattedData,
      });

      router.push('/transaction/fuel-in');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Fuel In" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/transaction/fuel-in/detail/${id}`)}
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
            <div className="col-span-3 grid grid-cols-3 items-start gap-4">
              <label className="text-left font-medium pt-2">Tanggal :</label>
              <div className="col-span-2 flex flex-col gap-1">
                <Controller
                  control={control}
                  name="date"
                  rules={{ required: "Tanggal wajib diisi" }}
                  render={({ field: { onChange, value, ref } }) => (
                    <DatePicker
                      selected={value as Date}
                      onChange={onChange}
                      dateFormat="yyyy-MM-dd"
                      className="w-75 border rounded px-3 py-2"
                      placeholderText="Pilih Tanggal"
                      minDate={new Date("2024-01-01")}
                      ref={ref}
                    />
                  )}
                />
                {errors.date && (
                  <span className="text-sm text-red-500">{errors.date.message}</span>
                )}
              </div><SelectField
              label="Vendor"
              {...register('vendor', {
                required: 'Vendor wajib diisi', 
              })}
              value={watch('vendor')}
              onChange={(e) => setValue('vendor', e.target.value)}
              options={vendorOptions}
              error={errors.vendor?.message}
            /> 
            <SelectField
              label="Code"
              {...register('code', {
                required: 'Code wajib diisi', 
              })}
              value={watch('code')}
              onChange={(e) => setValue('code', e.target.value)}
              options={codeOptions}
              error={errors.code?.message}
            />
            <InputFieldsLabel
              label="Nomor Surat Jalan :"
              type="text"
              {...register('nomor_surat_jalan', {required: 'Nomor Surat Jalan wajib diisi'
              })}
              error={errors.nomor_surat_jalan?.message}
            />  
            <InputFieldsLabel
              label="Nomor Plat Mobil :"
              type="text"
              {...register('nomor_plat_mobil', {required: 'Nomor Plat Mobil wajib diisi'
              })}
              error={errors.nomor_plat_mobil?.message}
            />   
            <CommaDecimalInput<FuelIn>
                name="qty"
                label="Qty:"
                control={control}
                error={errors.qty}
                rawValue={qtyRaw ?? ''}
                setRawValue={setQtyRaw}
              /> 
            <CommaDecimalInput<FuelIn>
                name="qty_now"
                label="Qty Aktual:"
                control={control}
                error={errors.qty_now}
                rawValue={qtyNowRaw ?? ''}
                setRawValue={setQtyNowRaw}
              /> 
            <InputFieldsLabel
              label="Driver :"
              type="text"
              {...register('driver', {required: 'Driver wajib diisi'
              })}
              error={errors.driver?.message}
            />   
            <SelectField
              label="Tujuan Awal"
              {...register('tujuan_awal', {
                required: 'Tujuan Awal wajib diisi', 
              })}
              value={watch('tujuan_awal')}
              onChange={(e) => setValue('tujuan_awal', e.target.value)}
              options={tujuanAwalOptions}
              error={errors.tujuan_awal?.message}
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
