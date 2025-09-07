'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import ContentHeader from '@/components/ContentHeader';
import ButtonAction from '@/components/ButtonAction';
import { Funnel } from 'lucide-react';
import FilterModal from '@/components/Modal';
import FilterForm from './FilterForm';
import { MrpAPI } from '@/api';
import { BackLog } from '@/types/BackLogValues';
import { setBacklogOrigin } from '@/redux/features/backlogSlice';
  

export default function BackLogReviewPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [mounted, setMounted] = useState(false);
  const [backLogList, setBackLogReviewList] = useState<BackLog[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    unit_id: '',
    component: '', 
    date_of_inspection: '',
    plan_replace_repair: '',
    po_number: '',
    pp_number: '',
    status: '', 
  });
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleGoToDetail = (id: string) => {
    dispatch(setBacklogOrigin('review-backlog'));
    router.push(`/backlog/detail/${id}`);
  };

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.push('/login');
    } 
  }, [token, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          field: sortField,
          sort: sortDirection,
          ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== '' && value !== '0')
          ),
        }).toString();

        const response = await MrpAPI({
          url: `/backlog/list/pagination?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setBackLogReviewList(res.data);
        setTotalPages(res.total_pages);
      } catch (error) {
        console.error('Failed to fetch alat berat:', error);
      }
    };

    if (token) fetchData();
  }, [token, page, filters, sortField, sortDirection, limit]);

  if (!mounted) return null;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  return (
    <div>
      <ContentHeader className="mx-auto" title="Data Backlog Control System" />
      <div className="flex justify-between items-center w-full mb-4">
        <ButtonAction
          className="px-2"
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={24} />}
        >
          Filter
        </ButtonAction> 
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FF3131] text-white text-center">
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('brand_name')}>
                EGI {sortField === 'brand_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('unit_name')}>
                Code Number {sortField === 'unit_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('hm_breakdown')}>
                HM Breakdown {sortField === 'hm_breakdown' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('problem')}>
                Problem Description {sortField === 'problem' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('component')}>
                Component {sortField === 'component' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>  
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('date_of_inspection')}>
                Date Of Inspection {sortField === 'date_of_inspection' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('plan_replace_repair')}>
                Plan Replace and Repair Date {sortField === 'plan_replace_repair' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('hm_ready')}>
                HM Ready {sortField === 'hm_ready' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('pp_number')}>
                PP Number {sortField === 'pp_number' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('po_number')}>
                PO Number {sortField === 'po_number' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('aging_backlog_by_date')}>
                Aging Backlog By Date {sortField === 'aging_backlog_by_date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
            </tr>
          </thead>
          <tbody>
            {backLogList.length > 0 ? (
              backLogList.map((backlog, index) => (
                <tr key={backlog.ID} className="border-t text-center">
                  <td className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
                      onClick={() => handleGoToDetail(`${backlog.ID}`)}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-2">{backlog.Unit?.brand.brand_name} {backlog.Unit?.series.series_name}</td>
                  <td className="px-4 py-2">{backlog.Unit?.unit_name}</td>
                  <td className="px-4 py-2">{backlog.hm_breakdown}</td>
                  <td className="px-4 py-2">{backlog.problem}</td>
                  <td className="px-4 py-2">{backlog.component}</td>  
                  <td className="px-4 py-2">{backlog.date_of_inspection as string || "-"}</td>  
                  <td className="px-4 py-2">{backlog.plan_replace_repair as string || "-"}</td>  
                  <td className="px-4 py-2">{backlog.hm_ready}</td>  
                  <td className="px-4 py-2">{backlog.pp_number}</td>  
                  <td className="px-4 py-2">{backlog.po_number}</td> 
                  <td className="px-4 py-2">{backlog.status}</td> 
                  <td className="px-4 py-2">{backlog.AgingBacklogByDate}</td> 
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={16} className="px-4 py-2 text-center">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center mt-4 space-x-2">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const pageNum = i + 1;

          const maxVisible = 5;
          const half = Math.floor(maxVisible / 2);
          let start = Math.max(1, page - half);
          let end = start + maxVisible - 1;

          if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
          }

          // Skip pages outside visible range
          if (pageNum < start || pageNum > end) return null;

          return (
            <button
              key={pageNum}
              onClick={() => setPage(pageNum)}
              className={`px-3 py-1 rounded ${
                page === pageNum
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterForm
          onApply={(values) => {
            setFilters({ 
              unit_id: values.unit_id?.toString() || '',
              component: values.component?.toString() || '', 
              date_of_inspection: values.date_of_inspection?.toString() || '',
              plan_replace_repair: values.plan_replace_repair?.toString() || '',
              po_number: values.po_number?.toString() || '',
              pp_number: values.pp_number?.toString() || '',
              status: values.status?.toString() || '', 
            });
            setPage(1); // reset to page 1
            setIsFilterOpen(false);
          }}
          onReset={() => {
            setFilters({
              unit_id: '',
              component: '', 
              date_of_inspection: '',
              plan_replace_repair: '',
              po_number: '',
              pp_number: '',
              status: '', 
            });
            setPage(1);
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </div>
  );
}
