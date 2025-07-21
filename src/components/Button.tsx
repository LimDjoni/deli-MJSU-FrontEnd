'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="w-full bg-[#FF3131] text-white border border-transparent py-2 rounded-lg hover:bg-white hover:border-black hover:text-black transition"
    >
      {children}
    </button>
  );
}