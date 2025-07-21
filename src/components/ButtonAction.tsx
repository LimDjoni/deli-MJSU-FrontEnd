'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: ReactNode; 
  className?: string;
}

export default function ButtonAction({ icon, children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`mt-6 w-auto flex items-center justify-center gap-2 bg-[#FF3131] text-white border border-transparent py-2 rounded-lg hover:bg-white hover:border-black hover:text-black transition ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}