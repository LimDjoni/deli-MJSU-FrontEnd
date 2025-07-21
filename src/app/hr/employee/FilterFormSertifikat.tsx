import React from 'react';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import ErrorMessage from '@/components/ErrorMessage';
import SelectField from '@/components/SelectField';
import { sertifikatOptions } from '@/types/OptionsValue';
import TextAreaField from '@/components/TextAreaField';

interface FilterFormSertifikatProps {
  onApply: (filters: {
    sertifikat: string;
    date_effective: string;
    remark: string;
  }) => void;
  onReset: () => void;
}

type FormValues = {
  sertifikat: string;
  date_effective: Date | null;
  remark: string;
};

const FilterFormSertifikat: React.FC<FilterFormSertifikatProps> = ({ onApply, onReset }) => {
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
      sertifikat: '',
      date_effective: null,
      remark: '',
    },
  });

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const onSubmit = (data: FormValues) => { 
    onApply({
      sertifikat: data.sertifikat,
      date_effective: data.date_effective ? formatToLocalTime(data.date_effective.toISOString()) : '',
      remark: data.remark,
    });
    reset(); // optional: clear form
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Tambah Data Sertifikat</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SelectField
            label="Jenis Sertifikat"
            {...register('sertifikat', { required: 'Sertifikat wajib dipilih' })}
            value={watch('sertifikat') ?? ''}
            onChange={(e) => setValue('sertifikat', e.target.value)}
            options={sertifikatOptions}
            error={errors.sertifikat?.message}
          />
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Masa Berlaku :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="date_effective"
                rules={{ required: 'Masa Berlaku wajib diisi' }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.date_effective ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Masa Berlaku"
                  />
                )}
              />
              <ErrorMessage>{errors.date_effective?.message}</ErrorMessage>
            </div>
          </div> 
          <TextAreaField
            label="Keterangan"
            value={watch('remark') ?? ''}
            onChange={(e) => setValue('remark', e.target.value)}
            placeholder="Masukkan informasi Keterangan"
            error={errors.remark?.message} 
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

export default FilterFormSertifikat;
