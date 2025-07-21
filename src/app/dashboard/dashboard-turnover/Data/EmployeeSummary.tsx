'use client'; 

import { FaUserTie, FaUserAltSlash, FaUserCheck, FaUserTimes  } from 'react-icons/fa';
import { DashboardEmployeeTurnover } from '@/types/DashboardValues'; 

interface EmployeeSummaryProps {
  data: DashboardEmployeeTurnover | null;
}

const EmployeeSummary: React.FC<EmployeeSummaryProps> = ({ data }) => { 
  const summaryData = data ? [
    { label: 'NEW HIRE', value: data.total_hire, icon: <FaUserTie />, color: 'bg-orange-200' },
    { label: 'RESIGN', value: data.total_resign, icon: <FaUserAltSlash />, color: 'bg-blue-300' },
    { label: 'BERAKHIR PKWT', value: data.total_berakhir_pkwt, icon: <FaUserCheck />, color: 'bg-yellow-300' },
    { label: 'PHK', value: data.total_phk, icon: <FaUserTimes />, color: 'bg-green-200' }, 
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