'use client';

import type { ReactNode } from 'react';

export default function ErrorMessage({ children }: { children: ReactNode }) {
  if (!children) return null;

  return (
    <p className="text-sm text-red-500 mt-1">
      {children}
    </p>
  );
}