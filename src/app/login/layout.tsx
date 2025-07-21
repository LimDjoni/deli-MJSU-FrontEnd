import type { ReactNode } from 'react';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-[#CCCCCC]">
      {children}
    </section>
  );
}