'use client'; 

import { FaUsers, FaMale, FaFemale, FaBuilding, FaHardHat } from 'react-icons/fa';
import { DashboardEmployee } from '@/types/DashboardValues'; 

interface EmployeeSummaryProps {
  data: DashboardEmployee | null;
}

const EmployeeSummary: React.FC<EmployeeSummaryProps> = ({ data }) => { 
  const summaryData = data ? [
    { label: 'TOTAL', value: data.total_employee, icon: <FaUsers />, color: 'bg-orange-200' },
    { label: 'MALE', value: data.total_male, icon: <FaMale />, color: 'bg-blue-300' },
    { label: 'FEMALE', value: data.total_female, icon: <FaFemale />, color: 'bg-yellow-300' },
    { label: 'HO', value: data.hired_ho, icon: <FaBuilding />, color: 'bg-green-200' },
    { label: 'SITE', value: data.hired_site, icon: <FaHardHat />, color: 'bg-red-300' },
  ] : [];

  return (
    <div className="flex flex-wrap gap-4 ">
      {summaryData.map((item, index) => (
        <div
          key={index}
          className={`flex items-center justify-between w-48 p-4 rounded-xl shadow ${item.color}`}
        >
          <div className="text-3xl">{item.icon}</div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-600">{item.label}</div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmployeeSummary;