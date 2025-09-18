import { assetTypeOptions, BarangMasukFilter } from '@/types/AssetValues';
import React from 'react'; 
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import SelectField from '@/components/SelectField';

interface FilterFormProps {
  onApply: (filters: {
    asset_type_id?: string; 
    tanggal? : string | Date | null; 
  }) => void;
  onReset: () => void;
} 

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {   
  const {
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BarangMasukFilter>({
    defaultValues: {
      asset_type_id: '',
      tanggal : null, 
    },
  });

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };


  const onSubmit = (data: BarangMasukFilter) => { 
    onApply({
      asset_type_id: data.asset_type_id,
      tanggal: data.tanggal ? formatToLocalTime(data.tanggal.toISOString()) : '', 
    });
    reset(); // optional: clear form
  };

  const handleReset = () => {
    reset();
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Barang Masuk</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> 
          <SelectField
            label="Jenis Asset"
            {...register('asset_type_id')}
            value={watch('asset_type_id') ?? ''}
            onChange={(e) => setValue('asset_type_id', e.target.value)}
            options={assetTypeOptions}
          /> 
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <label className="text-left font-medium pt-2">Tanggal :</label>
            <div className="col-span-2 space-y-1">
              <Controller
                control={control}
                name="tanggal"
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="yyyy-MM-dd"
                    className={`w-75 border rounded px-3 py-2 ${errors.tanggal ? 'border-red-500' : ''}`}
                    placeholderText="Pilih Tanggal"
                  />
                )}
              />
            </div>
          </div> 
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleReset}
            className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-50"
          >
            Reset
          </button>
          <button
            type="submit"
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Terapkan
          </button>
        </div>
    </form>
    </>
  );
};

export default FilterForm;
