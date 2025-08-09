'use client';

import { useState } from 'react';
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
import CommaDecimalInput from '@/components/CommaDecimalInput';
import { FuelIn } from '@/types/FuelInValues';
import { codeOptions, tujuanAwalOptions, vendorOptions } from '@/types/OptionsValue';

export default function TambahDataFuelInForm() { 
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [qtyRaw, setQtyRaw] = useState('0'); // store raw user input
  const [qtyNowRaw, setQtyNowRaw] = useState('0'); // store raw user input

  const {
  register,
  handleSubmit,
  control, 
  watch,
  setError,
  setValue,
  formState: { errors },
} = useForm<FuelIn>({
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

    const formatToLocal = (isoString: Date ) => { 
      const date = new Date(isoString);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }; 
    
    
  const onSubmit = async (dataFuelIn: FuelIn) => {  
    let hasError = false;
 
    if (isNaN(dataFuelIn.qty) || dataFuelIn.qty <= 0) {
      setError("qty", { type: "manual", message: "Qty wajib diisi" });
      hasError = true;
    }

    if (isNaN(dataFuelIn.qty_now) || dataFuelIn.qty_now <= 0) {
      setError("qty_now", {type: "manual", message: "Qty Aktual wajib diisi"});
      hasError = true;
    } 

    if (hasError) return; 
      try { 
        const formattedData = {
          ...dataFuelIn,
          date: formatToLocal(dataFuelIn.date as Date), 
        };
        const data  = await MrpAPI({
          url: "/fuelin/create",
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
        router.push("/transaction/fuel-in");
      } catch {
        setError("root.serverError", {
          type: "manual",
          message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
        });
      }
    }; 
 
  return (
    <>
    <div className="relative mx-auto"> 
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Fuel In" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button"  
            onClick={() => router.push('/transaction/fuel-in/')}
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
              </div>
            </div>  
            <SelectField
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
                rawValue={qtyRaw}
                setRawValue={setQtyRaw}
              />
            <CommaDecimalInput<FuelIn>
                name="qty_now"
                label="Qty Aktual:"
                control={control}
                error={errors.qty_now}
                rawValue={qtyNowRaw}
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
      </form>
    </div>
    </>
  );
}
