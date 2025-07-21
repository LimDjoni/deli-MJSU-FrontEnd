import React from 'react';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorMessage from '@/components/ErrorMessage';
import TextAreaField from '@/components/TextAreaField';   
import SelectField from '@/components/SelectField';
import { statusTerakhirOptions } from '@/types/OptionsValue';

interface FilterFormHistoryProps {
  onApply: (filters: {
    status_terakhir: string;
    tanggal: string;
    keterangan: string;
  }) => void;
  onReset: () => void;
}

type FormValues = {
  status_terakhir: string;
  tanggal: Date | null;
  keterangan: string;
}; 

const FilterFormHistory: React.FC<FilterFormHistoryProps> = ({ onApply, onReset }) => {
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      status_terakhir: '',
      tanggal: null,
      keterangan: '',
    },
  });

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const onSubmit = (data: FormValues) => { 
    onApply({
      status_terakhir: data.status_terakhir,
      tanggal: data.tanggal ? formatToLocalTime(data.tanggal.toISOString()) : '',
      keterangan: data.keterangan,
    });
    reset(); // optional: clear form
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Tambah Data History</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal History :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="tanggal"
                rules={{ required: 'Tanggal History wajib diisi' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.tanggal ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal History"
                  />
                )}
              />
              <ErrorMessage>{errors.tanggal?.message}</ErrorMessage>
            </div>
          </div> 
          
          <SelectField
            label="Status Terakhir"
            {...register('status_terakhir', { required: 'Status Terakhir wajib dipilih' })}
            value={watch('status_terakhir') ?? ''}
            onChange={(e) => setValue('status_terakhir', e.target.value)}
            options={statusTerakhirOptions}
            error={errors.status_terakhir?.message}
          />    
          <TextAreaField
            label="Keterangan"
            value={watch('keterangan') ?? ''}
            onChange={(e) => setValue('keterangan', e.target.value)}
            placeholder="Masukkan Keterangan"
            error={errors.keterangan?.message} 
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
            Tambah
          </button>
        </div>
      </form>
    </>
  );
};

export default FilterFormHistory;
