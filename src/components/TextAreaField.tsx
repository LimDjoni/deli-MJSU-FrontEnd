import React from 'react';
import ErrorMessage from './ErrorMessage';

type TextareaFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  error,
  rows = 4,
  ...rest
}) => {
  return ( 
    <div className="col-span-3 grid grid-cols-3 items-start gap-4">
        <label className="pt-2 text-left font-medium">{label} :</label>
        <div className="col-span-2 flex flex-col gap-1">
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-75 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black ${
                error ? 'border-red-500' : ''
                }`}
                {...rest}
            />
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    </div> 
  );
};

export default TextareaField;