'use client';

import type { InputHTMLAttributes } from 'react';
import ErrorMessage from './ErrorMessage';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export default function InputField({ error, className = '', ...props }: InputFieldProps) {
  return (
    <div className="w-full md:w-80 mx-auto">
      <input
        {...props}
        className={`w-full border px-4 py-2 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
        <ErrorMessage>{error}</ErrorMessage>
    </div>
  );
}