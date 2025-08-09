import React from 'react';
import 'react-datepicker/dist/react-datepicker.css'; 
import ErrorMessage from '@/components/ErrorMessage';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';
import { AdjustStock } from '@/types/FuelInValues';

interface FilterFormProps {
  onApply: (filters: {
    date: string;
    stock: string;
  }) => void;
  onReset: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onReset }) => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustStock>({
    defaultValues: {
      date: '',
      stock: 0,
    },
  });

  const submitHandler = (data: AdjustStock) => {
    onApply({
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
      stock: data.stock?.toString() || '',
    });
  };

  const resetHandler = () => {
    reset({
      date: '',
      stock: 0,
    });
    onReset();
  };

  return (
    <>
      <h2 className="text-xl font-bold mb-6">Filter Data Adjust Stock</h2>
      <form onSubmit={handleSubmit(submitHandler)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Date */}
          <div className="space-y-1">
            <label className="block text-sm font-medium mb-1">Tanggal :</label>
            <Controller
              control={control}
              name="date" 
              render={({ field }) => (
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="yyyy-MM-dd"
                  className={`w-75 border rounded px-3 py-2 ${errors.date ? 'border-red-500' : ''}`}
                  placeholderText="Pilih Tanggal"
                />
              )}
            />
            <ErrorMessage>{errors.date?.message}</ErrorMessage>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium mb-1">Qty</label>
            <input
              type="number"
              {...register('stock')}
              className="w-full border rounded px-3 py-2"
              placeholder="Masukkan Qty"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={resetHandler}
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
