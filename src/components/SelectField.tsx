'use client';

import React from 'react';
import ErrorMessage from './ErrorMessage';

interface Option {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: Option[];
  className?: string;
  required?: boolean;
  error?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  className = '',
  required = false,
  error = '',
}: SelectFieldProps) {
  return (
    <div className="col-span-3 grid grid-cols-3 items-start gap-4">
      <label className="text-left font-medium pt-2">{label} :</label>
      <div className="col-span-2 flex flex-col gap-1">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className={`border rounded px-3 py-2 w-75 ${error ? 'border-red-500' : ''} ${className}`}
        >
          <option value="">Pilih {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    </div>
  );
}
