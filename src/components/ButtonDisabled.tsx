'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  children: ReactNode; 
  className?: string;
}

export default function ButtonDisabled({ icon, children, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`mt-6 w-auto flex items-center justify-center gap-2 bg-white text-black border border-black py-2 rounded-lg hover:bg-[#FF3131] hover:border-transparent hover:text-white transition ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}