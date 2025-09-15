'use client';
 
import ContentHeader from "@/components/ContentHeader"; 
import ButtonAction from '@/components/ButtonAction';
import React, { useEffect, useState } from 'react';
import { Funnel } from 'lucide-react';
import FilterModal from "@/components/Modal"; 
import FilterFormPage from "./FilterFormPage";
import { MJSUAPI } from "@/api";
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { DashboardBackLog } from "@/types/DashboardValues";
import BottomSummary from "./Data/BottomSummary";
import BackLogSummary from "./Data/BackLogSummary";

export default function HRGADashboard() {  
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const code_emp = useSelector((state: RootState) => state.auth.user?.code_emp);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [detail, setDetail] = useState<DashboardBackLog | null>(null);
  const [filters, setFilters] = useState({
    year: '', 
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
          url: `/backlog/dashboard?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setDetail(res); 
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
      <ContentHeader className="!text-start" title="Dashboard Backlog Control System" /> 
      <ButtonAction
          className="px-2"
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={24} />}
        >
          Filter
      </ButtonAction>
    </div>
    
      <main className="py-6">
        <BackLogSummary data={detail} />
        <BottomSummary data={detail} />
        {/* other components */}
      </main>
    <div className="w-full overflow-x-hidden"> 
    </div>

    <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
      <FilterFormPage
        onApply={(values) => {
          setFilters({
            year: values.year || '',
          });
          setIsFilterOpen(false);
        }}
        onReset={() => {
          setFilters({
            year: '',
          });
          setIsFilterOpen(false);
        }}
      />
    </FilterModal> 
    </>
  );
}