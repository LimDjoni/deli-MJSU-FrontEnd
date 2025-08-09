'use client';

import { useState } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader'; 
import { MrpAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux'; 
import { Controller, useForm } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CommaDecimalInput from '@/components/CommaDecimalInput';
import { AdjustStock } from '@/types/FuelInValues'; 

export default function TambahDataAdjustStockForm() { 
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [stockRaw, setStockRaw] = useState('0'); // store raw user input 

  const {
  handleSubmit,
  control, 
  setError,
  formState: { errors },
} = useForm<AdjustStock>({
  mode: 'onSubmit',
  defaultValues: {
    date: '',
    stock: 0, 
  },
});   

    const formatToLocal = (isoString: Date ) => { 
      const date = new Date(isoString);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }; 
    
    
  const onSubmit = async (dataAdjustStock: AdjustStock) => {  
    let hasError = false;
 
    if (isNaN(dataAdjustStock.stock) || dataAdjustStock.stock <= 0) {
      setError("stock", { type: "manual", message: "Stock wajib diisi" });
      hasError = true;
    } 

    if (hasError) return; 
      try { 
        const formattedData = {
          ...dataAdjustStock,
          date: formatToLocal(dataAdjustStock.date as Date), 
        };
        const data  = await MrpAPI({
          url: "/adjuststock/create",
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
        router.push("/transaction/adjust-stock");
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
            <CommaDecimalInput<AdjustStock>
                name="stock"
                label="Stock :"
                control={control}
                error={errors.stock}
                rawValue={stockRaw}
                setRawValue={setStockRaw}
              /> 
          </div> 
        </div> 
      </form>
    </div>
    </>
  );
}
