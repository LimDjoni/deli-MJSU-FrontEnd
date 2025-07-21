import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorMessage from '@/components/ErrorMessage';
import TextAreaField from '@/components/TextAreaField';
import SelectField from '@/components/SelectField';
import { hasilMCUOptions } from '@/types/OptionsValue';

interface FilterEditFormMCUProps {
  onApply: (filters: {
    mcu: string;
    date_mcu: string;
    date_end_mcu: string;
    hasil_mcu: string;
  }) => void;
  onReset: () => void;
   defaultValues?: {
    mcu?: string;
    date_mcu?: Date | null; 
    date_end_mcu?: Date | null;
    hasil_mcu?: string;
  };
}

type FormValues = {
  mcu: string;
  date_mcu: Date | null;
  date_end_mcu: Date | null;
  hasil_mcu: string;
};

const FilterEditFormMCU: React.FC<FilterEditFormMCUProps> = ({ onApply, onReset, defaultValues }) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      mcu: '',
      date_mcu: null,
      date_end_mcu: null,
      hasil_mcu: '',
    },
  });

   useEffect(() => {
    if (defaultValues) {
      reset({
        mcu: defaultValues.mcu || '',
        date_mcu:
          defaultValues.date_mcu && typeof defaultValues.date_mcu === 'string'
            ? new Date(defaultValues.date_mcu)
            : defaultValues.date_mcu ?? null, 
        date_end_mcu:
          defaultValues.date_end_mcu && typeof defaultValues.date_end_mcu === 'string'
            ? new Date(defaultValues.date_end_mcu)
            : defaultValues.date_end_mcu ?? null, 
        hasil_mcu: defaultValues.hasil_mcu || '',
      });
    }
  }, [defaultValues, reset]);

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const onSubmit = (data: FormValues) => { 
    onApply({
      mcu: data.mcu,
      date_mcu: data.date_mcu ? formatToLocalTime(data.date_mcu.toISOString()) : '',
      date_end_mcu: data.date_end_mcu ? formatToLocalTime(data.date_end_mcu.toISOString()) : '',
      hasil_mcu: data.hasil_mcu,
    });
    reset(); // optional: clear form
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Ubah Data MCU</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal Pelaksanaan MCU :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="date_mcu"
                rules={{ required: 'Tanggal Pelaksanaan MCU wajib diisi' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.date_mcu ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal Pelaksanaan MCU"
                  />
                )}
              />
              <ErrorMessage>{errors.date_mcu?.message}</ErrorMessage>
            </div>
          </div> 
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal MCU Berikutnya :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="date_end_mcu"
                rules={{ required: 'Tanggal MCU Berikutnya wajib diisi' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.date_end_mcu ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal MCU Berikutnya"
                  />
                )}
              />
              <ErrorMessage>{errors.date_mcu?.message}</ErrorMessage>
            </div>
          </div>
          <SelectField
            label="Hasil MCU"
            value={watch('hasil_mcu') ?? ''}
            onChange={(e) => setValue('hasil_mcu', e.target.value)}
            options={hasilMCUOptions}
            error={errors.hasil_mcu?.message}
          />    
          <TextAreaField
            label="MCU"
            value={watch('mcu') ?? ''}
            onChange={(e) => setValue('mcu', e.target.value)}
            placeholder="Masukkan informasi MCU"
            error={errors.mcu?.message} 
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Simpan
          </button>
        </div>
      </form>
    </>
  );
};

export default FilterEditFormMCU;
