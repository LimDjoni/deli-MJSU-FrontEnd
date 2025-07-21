'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import ErrorMessage from './ErrorMessage';

interface InputFieldsLabelProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string; 
  required?: boolean;
  error?: string;
}

const InputFieldsLabel = forwardRef<HTMLInputElement, InputFieldsLabelProps>(
  ({ label, error, required = false , ...props }, ref) => {
    return (
      <div className="col-span-3 grid grid-cols-3 items-start gap-4">
        <label className="pt-2 text-left font-medium">{label}</label>
        <div className="col-span-2 flex flex-col gap-1">
          <input
            {...props}
            ref={ref}
            min={0}
            required={required}
            className={`border rounded px-3 py-2 w-75 ${error ? 'border-red-500' : ''}`}
          />
          <ErrorMessage>{error}</ErrorMessage>
        </div>
      </div>
    );
  }
);

InputFieldsLabel.displayName = 'InputFieldsLabel';
export default InputFieldsLabel;