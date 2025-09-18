'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function DashboardPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const department = useSelector(
    (state: RootState) => state.auth.user?.employee?.Department?.department_name
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // If no token, redirect to login
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!department) {
    return (
      <div className="text-gray-500 text-sm p-4">
        Loading dashboard based on your department...
      </div>
    );
  }

  const renderDashboardByRole = () => {
    switch (department) { 
      case 'SHE':
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
            <p className="text-gray-700">Welcome to your personal dashboard.</p>
            {/* Add user-specific widgets here */}
          </>
        );  
      default:
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-red-600">
              Your department ({department}) is not authorized to view this dashboard.
            </p>
          </>
        );
    }
  };

  return <div>
    {renderDashboardByRole()}
    </div>;
}
