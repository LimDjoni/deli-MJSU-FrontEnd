import React from 'react';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorMessage from '@/components/ErrorMessage';
import SelectField from '@/components/SelectField';
import { kontrakOptions, penempatanOptions, ptOptions } from '@/types/OptionsValue';

interface FilterFormKontrakProps {
  onApply: (filters: {
    pt: string;
    tanggal_doh: string;
    tanggal_end_doh: string;
    masa_kontrak: number | null;
    penempatan: string; 
    status_kontrak: string; 
  }) => void;
  onReset: () => void;
}

type FormValues = {
  pt: string;
  doh_date: Date | null;
  tanggal_end_doh: Date | null;
  masa_kontrak: number | null;
  penempatan: string; 
  status_kontrak: string; 
};

const FilterFormKontrak: React.FC<FilterFormKontrakProps> = ({ onApply, onReset }) => {
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
      pt: '',
      doh_date: null,
      tanggal_end_doh: null,
      penempatan: '',
      status_kontrak: '',
    },
  });

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const onSubmit = (data: FormValues) => { 
    onApply({
      pt: data.pt,
      tanggal_doh: data.doh_date ? formatToLocalTime(data.doh_date.toISOString()) : '',
      tanggal_end_doh: data.tanggal_end_doh ? formatToLocalTime(data.tanggal_end_doh.toISOString()) : '',  
      masa_kontrak : null,
      penempatan: data.penempatan,
      status_kontrak: data.status_kontrak,     
    });
    reset(); // optional: clear form
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Tambah Data DOH</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal Mulai Kontrak :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="doh_date"
                rules={{ required: 'Tanggal Mulai Kontrak wajib diisi' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.doh_date ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal Mulai Kontrak"
                  />
                )}
              />
              <ErrorMessage>{errors.doh_date?.message}</ErrorMessage>
            </div>
          </div>  
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal Berakhir Kontrak :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="tanggal_end_doh"
                rules={{ required: 'Tanggal Berakhir Kontrak wajib diisi' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.tanggal_end_doh ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal Berakhir Kontrak"
                  />
                )}
              />
              <ErrorMessage>{errors.doh_date?.message}</ErrorMessage>
            </div>
          </div> 
          <SelectField
            label="Penempatan"
            {...register('penempatan')}
            value={watch('penempatan')}
            onChange={(e) => setValue('penempatan', e.target.value)}
            options={penempatanOptions}
            error={errors.penempatan?.message as string}
          /> 
          <SelectField
            label="Status Kontrak"
            {...register('status_kontrak')}
            value={watch('status_kontrak')}
            onChange={(e) => setValue('status_kontrak', e.target.value)}
            options={kontrakOptions}
            error={errors.status_kontrak?.message as string}
          /> 
          <SelectField
            label="PT"
            {...register('pt', { required: 'PT wajib dipilih' })}
            value={watch('pt') ?? ''}
            onChange={(e) => setValue('pt', e.target.value)}
            options={ptOptions}
            error={errors.pt?.message}
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

export default FilterFormKontrak;
