'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const SidebarHeader = ({ isOpen }: { isOpen: boolean }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const firstname = user?.employee?.firstname ?? ''; 
  const lastname = user?.employee?.lastname ?? '';
  const role = Array.isArray(user?.role) ? user.role.join(', ') : user?.role ?? '';
  const department = user?.employee?.department?.department_name ?? '';
  const fullName = `${firstname} ${lastname}`.trim() || 'User';

  return (
    <div className="text-black font-semibold flex flex-col leading-tight">
      <span>{fullName}</span>
      {role && <span className="text-sm text-gray-600 font-normal">{role}</span>}
      {department && <span className="text-xs text-gray-500">{department}</span>}
    </div>
  );
};

export default SidebarHeader;