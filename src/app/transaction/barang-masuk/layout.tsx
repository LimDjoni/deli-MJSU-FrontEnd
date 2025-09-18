import Sidebar from '@/components/Sidebar'; 
import type { ReactNode } from 'react';

export default function AssetLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar>{children}</Sidebar>
    </div>
  );
}