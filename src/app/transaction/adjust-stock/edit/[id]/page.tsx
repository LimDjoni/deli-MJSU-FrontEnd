'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import FilterModal from '@/components/Modal';
import EditForm from '@/components/EditForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AdjustStock } from '@/types/FuelInValues';
import CommaDecimalInput from '@/components/CommaDecimalInput';
  

export default function EditDataAdjustStockForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [stockRaw, setStockRaw] = useState<string | undefined>();
  const submitFormRef = useRef<(() => void) | null>(null);
  
  const { handleSubmit, control, setValue, setError, formState: { errors } } = useForm<AdjustStock>({
    mode: 'onSubmit',
    defaultValues: {
      date: '',
      stock: 0, 
    },
  });  

 // Initial brand, equipment, series for prefill
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [detailRes] = await Promise.all([
          MrpAPI({ url: `/adjuststock/detail/${id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const detail = detailRes.data; 

        if (detail) {
          const { date, stock } = detail;

          // ✅ Set form values
          setValue('date', date ? new Date(date) : ''); 
          setValue('stock', stock ?? 0); 
          setStockRaw(stock?.toString().replace('.', ',') || ''); 
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

  const onSubmit = async (values: AdjustStock) => {
    let hasError = false;
 
    if (isNaN(values.stock) || values.stock <= 0) {
      setError("stock", { type: "manual", message: "Stock wajib diisi" });
      hasError = true;
    }
  
    if (hasError) return;
    try { 
        const formattedData = {
          ...values,
          date: formatToLocal(values.date as Date), 
        };
      await MrpAPI({
        url: `/adjuststock/update/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: formattedData,
      });

      router.push('/transaction/adjust-stock');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Adjust Stock" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/transaction/adjust-stock/detail/${id}`)}
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
              </div> 
            <CommaDecimalInput<AdjustStock>
                name="stock"
                label="Stock:"
                control={control}
                error={errors.stock}
                rawValue={stockRaw ?? ''}
                setRawValue={setStockRaw}
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
