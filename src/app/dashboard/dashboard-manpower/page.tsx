'use client';
 
import ContentHeader from "@/components/ContentHeader"; 
import ButtonAction from '@/components/ButtonAction';
import React, { useEffect, useState } from 'react';
import { Funnel } from 'lucide-react';
import FilterModal from "@/components/Modal";
import EmployeeSummary from "./Data/EmployeeSummary";
import FilterFormPage from "./FilterFormPage";
import { MJSUAPI } from "@/api";
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { DashboardEmployee } from "@/types/DashboardValues";
import BottomSummary from "./Data/BottomSummary";

export default function HRGADashboard() {  
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const code_emp = useSelector((state: RootState) => state.auth.user?.code_emp);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detail, setDetail] = useState<DashboardEmployee | null>(null);
  const [filters, setFilters] = useState({
    pt: '',
    department_id: '', 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build query string, skipping empty or default values
        const query = new URLSearchParams(
          Object.fromEntries(
            Object.entries(filters).filter(
              ([, value]) => value !== '' && value !== '0'
            )
          )
        ).toString();

        const response = await MJSUAPI({
          url: `/employee/list/dashboard/${code_emp}?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setDetail(res);
        console.log(res);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    // Run only if token and code_emp are available
    if (token && code_emp) {
      fetchData();
    }
  }, [token, filters, code_emp]);


  return ( 
    <>
    <div className="flex flex-row justify-between">
      <div>
        <ContentHeader 
          className="!text-start" 
          title={`Dashboard Manpower - ${filters.pt ? filters.pt : 'ALL'}`} 
          subtitle={`Periode: ${new Date().toLocaleString("id-ID", { month: "long", year: "numeric" })}`} 
        /> 
      </div>
      <ButtonAction
          className="px-2"
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={24} />}
        >
          Filter
      </ButtonAction>
    </div>
    
      <main className="py-6">
        <EmployeeSummary data={detail} />
        <BottomSummary data={detail} />
        {/* other components */}
      </main>
    <div className="w-full overflow-x-hidden"> 
    </div>

    <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
      <FilterFormPage
        onApply={(values) => {
          setFilters({
            pt: values.pt?.join(',') || '',
            department_id: values.department_id?.join(',') || '',
          });
          setIsFilterOpen(false);
        }}
        onReset={() => {
          setFilters({
            pt: '',
            department_id: '',
          });
          setIsFilterOpen(false);
        }}
      />
    </FilterModal> 
    </>
  );
}