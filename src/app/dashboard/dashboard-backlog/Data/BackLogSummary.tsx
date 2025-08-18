'use client'; 

import { DashboardBackLog } from '@/types/DashboardValues'; 

interface BackLogSummaryProps {
  data: DashboardBackLog | null;
}

const BackLogSummary: React.FC<BackLogSummaryProps> = ({ data }) => { 
  const summaryData = data ? [
    { label: 'TOTAL BACKLOG', value: data.total_backlog, color: 'bg-orange-200' },
    { label: '0-5 Days', value: data.total_1, color: 'bg-blue-300' },
    { label: '6-15 Days', value: data.total_2, color: 'bg-yellow-300' },
    { label: '16-30 Days', value: data.total_3, color: 'bg-green-200' },  
    { label: 'More Than 30 Days', value: data.total_4, color: 'bg-red-300' },  
  ] : [];

  return (
    <div className="flex flex-wrap gap-4 ">
      {summaryData.map((item, index) => (
        <div
          key={index}
          className={`flex items-center justify-between w-48 p-4 rounded-xl shadow ${item.color}`}
        >
          <div className="text-center w-full">
            <div className="text-xs font-bold text-gray-600">{item.label}</div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BackLogSummary;