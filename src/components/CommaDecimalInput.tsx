import { Controller, Control, FieldError, FieldValues, Path } from 'react-hook-form';
import React from 'react';

type CommaDecimalInputProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  rawValue: string;
  setRawValue: (value: string) => void;
};
function CommaDecimalInput<T extends FieldValues>({
  name,
  label,
  placeholder = 'Contoh: 253,9',
  control,
  error,
  disabled = false,
  rawValue,
  setRawValue,
}: CommaDecimalInputProps<T>) {
  return (
    <div className="col-span-3 grid grid-cols-3 items-start gap-4">
      <label className="pt-2 text-left font-medium">{label}</label>
      <div className="col-span-2 flex flex-col gap-1">
        <Controller
          control={control}
          name={name}
          rules={{
            required: `${label} wajib diisi`,
            validate: (value) => {
              const strValue = value?.toString() ?? '';
              const parsed = parseFloat(strValue.replace(',', '.'));
              if (isNaN(parsed)) return 'Nilai tidak valid';
              if (parsed < 0) return 'Nilai tidak boleh negatif';
              return true;
            },
          }}
          render={({ field }) => (
            <input
              type="text"
              inputMode="decimal"
              className="w-75 border px-3 py-2 rounded"
              placeholder={placeholder}
              value={rawValue ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setRawValue(raw);

                const normalized = raw.replace(',', '.');
                const floatValue = parseFloat(normalized);

                field.onChange(isNaN(floatValue) ? null : floatValue);
              }}
              disabled={disabled}
            />
          )}
        />
        {error && <span className="text-red-500 text-sm">{error.message}</span>}
      </div>
    </div>
  );
}

export default CommaDecimalInput;
