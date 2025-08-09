import Sidebar from '@/components/Sidebar'; 
import type { ReactNode } from 'react';

export default function RangkumanFuelRatioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}