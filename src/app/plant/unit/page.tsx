'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ContentHeader from '@/components/ContentHeader';
import ButtonAction from '@/components/ButtonAction';
import { Funnel, Plus } from 'lucide-react';
import FilterModal from '@/components/Modal';
import FilterForm from '@/app/plant/unit/FilterForm';
import { MrpAPI } from '@/api';

type Unit = {
  ID: number;
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

export default function UnitPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [mounted, setMounted] = useState(false);
  const [unitsList, setUnitList] = useState<Unit[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    unit_name: '',
    brand_id: '',
    heavy_equipment_id: '',
    series_id: '', 
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

const createFlag = getCreateFlag(menuItems, '/plant/unit');

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
          url: `/unit/list/pagination?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setUnitList(res.data);
        setTotalPages(res.total_pages);
      } catch (error) {
        console.error('Failed to fetch unit:', error);
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
      <ContentHeader className="mx-auto" title="Data Unit" />
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
          onClick={() => createFlag && router.push('/plant/unit/add/')}
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
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('unit_name')}>
                Unit Name {sortField === 'unit_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('brand_id')}>
                Brand {sortField === 'brand_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('heavy_equipment_id')}>
                Jenis Alat Berat {sortField === 'heavy_equipment_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('series_id')}>
                Seri Alat Berat {sortField === 'series_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
            </tr>
          </thead>
          <tbody>
            {unitsList.length > 0 ? (
              unitsList.map((Units, index) => (
                <tr key={Units.ID} className="border-t text-center">
                  <td className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
                      onClick={() => router.push(`/plant/unit/detail/${Units.ID}`)}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-2">{Units.unit_name}</td>
                  <td className="px-4 py-2">{Units.brand?.brand_name}</td>
                  <td className="px-4 py-2">{Units.heavy_equipment?.heavy_equipment_name}</td>
                  <td className="px-4 py-2">{Units.series?.series_name}</td> 
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-2 text-center">
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
              unit_name: values.unit_name?.toString() || '',
              brand_id: values.brand_id?.toString() || '',
              heavy_equipment_id: values.heavy_equipment_name?.toString() || '',
              series_id: values.series_name?.toString() || '', 
            });
            setPage(1); // reset to page 1
            setIsFilterOpen(false);
          }}
          onReset={() => {
            setFilters({
              unit_name: '',
              brand_id: '',
              heavy_equipment_id: '',
              series_id: '', 
            });
            setPage(1);
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </div>
  );
}
