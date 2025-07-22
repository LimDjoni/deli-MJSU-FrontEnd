'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ContentHeader from '@/components/ContentHeader';
import ButtonAction from '@/components/ButtonAction';
import { Funnel, Plus } from 'lucide-react';
import FilterModal from '@/components/Modal';
import FilterForm from '@/app/transaction/fuel-ratio/FilterForm';
import { MrpAPI } from '@/api';

type FuelRatio = {
  ID: number; 
  unit_id: number;
  employee_id: number;
  shift: string;
  first_hm: string;
  last_hm: string | null;
  total_refill: number;
  tanggal_awal: number;
  tanggal_akhir: number;
  status: boolean;
  Unit: {
    unit_name: string;
    brand: {
      brand_name: string;
    };
    heavy_equipment: {
      heavy_equipment_name: string;
    };
    series: {
      series_name: string;
    };
  };
  Employee: {
    firstname: string;
    lastname: string;
  };
};

type MenuItem = {
  id: number;
  form_name: string;
  path?: string;
  children?: MenuItem[];
  create_flag?: boolean;
  update_flag?: boolean;
  read_flag?: boolean;
  delete_flag?: boolean;
};

export default function FuelRatioPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [mounted, setMounted] = useState(false);
  const [fuelRatioList, setFuelRatioList] = useState<FuelRatio[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    unit_id: '',
    employee_id: '',
    shift: '',
    first_hm: '',
    status: '', 
  });
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const menuItems = useSelector((state: RootState) => state.sidebar.menuItems);

  const getCreateFlag = (items: MenuItem[], targetPath: string): boolean => {
  for (const item of items) {
    if (item.path === targetPath) return item.create_flag ?? false;
    if (item.children) {
      const found = getCreateFlag(item.children, targetPath);
      if (found) return true;
    }
  }
  return false;
};

const createFlag = getCreateFlag(menuItems, '/transaction/fuel-ratio');

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
          url: `/fuelratio/list/pagination?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setFuelRatioList(res.data);
        setTotalPages(res.total_pages);
      } catch (error) {
        console.error('Failed to fetch fuel ratio:', error);
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
      <ContentHeader className="mx-auto" title="Data Fuel Ratio" />
      <div className="flex justify-between items-center w-full mb-4">
        <ButtonAction
          className="px-2"
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={24} />}
        >
          Filter
        </ButtonAction> 
        <ButtonAction
          disabled={!createFlag}
          className={`px-2 ${!createFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => createFlag && router.push('/transaction/fuel-ratio/add/')}
          icon={<Plus size={24} />}
        >
          Buat Baru
        </ButtonAction>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FF3131] text-white text-center">
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('unit_id')}>
                Nama Unit {sortField === 'unit_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('firstname')}>
                Nama Operator {sortField === 'firstname' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('shift')}>
                Shift {sortField === 'shift' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('first_hm')}>
                HM Awal {sortField === 'first_hm' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('last_hm')}>
                HM Akhir {sortField === 'last_hm' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('tanggal_awal')}>
                Tanggal dan Waktu Pengisian {sortField === 'tanggal_awal' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('tanggal_akhir')}>
                Tanggal dan Waktu Habis {sortField === 'tanggal_akhir' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('total_refill')}>
                Jumlah Pengisian Fuel (L) {sortField === 'total_refill' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
            </tr>
          </thead>
          <tbody>
            {fuelRatioList.length > 0 ? (
              fuelRatioList.map((datas, index) => (
                <tr key={datas.ID} className="border-t text-center">
                  <td className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
                      onClick={() => router.push(`/transaction/fuel-ratio/detail/${datas.ID}`)}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-2">{datas.Unit?.unit_name}</td>
                  <td className="px-4 py-2">
                    {`${datas.Employee?.firstname ?? ''} ${datas.Employee?.lastname ?? ''}`.trim()}
                  </td>
                  <td className="px-4 py-2">{datas.shift}</td>
                  <td className="px-4 py-2">{datas.first_hm}</td>
                  <td className="px-4 py-2">{datas.last_hm}</td>
                  <td className="px-4 py-2">{datas.tanggal_awal}</td>
                  <td className="px-4 py-2">{datas.tanggal_akhir}</td>
                  <td className="px-4 py-2">{datas.total_refill}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block w-5 h-5  ${
                        datas.status ? 'bg-green-500' : 'bg-yellow-400'
                      }`}
                    ></span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-2 text-center">
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

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Status Data Fuel Ratio</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-600 rounded-sm" />
            <span>Data Lengkap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-yellow-300 rounded-sm" />
            <span>Menunggu Kelengkapan Data</span>
          </div>
        </div>
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterForm
          onApply={(values) => {
            setFilters({
              unit_id: values.unit_id?.toString() || '',
              employee_id: values.employee_id?.toString() || '',
              shift: values.shift?.toString() || '',
              first_hm: values.first_hm?.toString() || '',
              status: values.status?.toString() || '',
            });
            setPage(1); // reset to page 1
            setIsFilterOpen(false);
          }}
          onReset={() => {
            setFilters({
              unit_id: '',
              employee_id: '',
              shift: '',
              first_hm: '',
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