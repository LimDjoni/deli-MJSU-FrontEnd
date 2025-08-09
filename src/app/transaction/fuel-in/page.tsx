'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ContentHeader from '@/components/ContentHeader';
import ButtonAction from '@/components/ButtonAction';
import { Funnel, Plus } from 'lucide-react';
import FilterModal from '@/components/Modal';
import FilterForm from '@/app/transaction/fuel-in/FilterForm';
import { MrpAPI } from '@/api'; 
import { FuelIn } from '@/types/FuelInValues';

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

export default function FuelInPage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [mounted, setMounted] = useState(false);
  const [fuelInList, setFuelInList] = useState<FuelIn[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ 
    vendor: '',
    code: '',
    nomor_surat_jalan: '',
    nomor_plat_mobil: '',
    qty: '',
    qty_now: '',
    driver: '',
    tujuan_awal: '',
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

const createFlag = getCreateFlag(menuItems, '/transaction/fuel-in');

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
          url: `/fuelin/list/pagination?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setFuelInList(res.data);
        setTotalPages(res.total_pages);
      } catch (error) {
        console.error('Failed to fetch fuel In:', error);
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
      <ContentHeader className="mx-auto" title="Data Fuel In" />
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
          onClick={() => createFlag && router.push('/transaction/fuel-in/add/')}
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
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('date')}>
                Tanggal {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('vendor')}>
                Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('code')}>
                B35/40 {sortField === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('nomor_surat_jalan')}>
                Nomor Surat Jalan {sortField === 'nomor_surat_jalan' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('nomor_plat_mobil')}>
                Nomor Plat Mobil {sortField === 'nomor_plat_mobil' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('qty')}>
                Qty {sortField === 'qty' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('qty_now')}>
                Qty Actual{sortField === 'qty_now' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('driver')}>
                Driver {sortField === 'driver' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('tujuan_awal')}>
                Tujuan Awal {sortField === 'tujuan_awal' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>  
            </tr>
          </thead>
          <tbody>
            {fuelInList.length > 0 ? (
              fuelInList.map((datas, index) => (
                <tr key={datas.ID} className="border-t text-center">
                  <td className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
                      onClick={() => router.push(`/transaction/fuel-in/detail/${datas.ID}`)}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-2">{datas.date as string}</td>
                  <td className="px-4 py-2">{datas.vendor}</td>
                  <td className="px-4 py-2">{datas.code}</td>
                  <td className="px-4 py-2">{datas.nomor_surat_jalan}</td>
                  <td className="px-4 py-2">{datas.nomor_plat_mobil}</td>
                  <td className="px-4 py-2">{Number(datas.qty).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">{Number(datas.qty_now).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">{datas.driver}</td>
                  <td className="px-4 py-2">{datas.tujuan_awal}</td> 
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

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <FilterForm
          onApply={(values) => {
            setFilters({
              vendor: values.vendor?.toString() || '',
              code: values.code?.toString() || '',
              nomor_surat_jalan: values.nomor_surat_jalan?.toString() || '',
              nomor_plat_mobil: values.nomor_plat_mobil?.toString() || '',
              qty: values.qty?.toString() || '',
              qty_now: values.qty_now?.toString() || '',
              driver: values.driver?.toString() || '',
              tujuan_awal: values.tujuan_awal?.toString() || '',
            });
            setPage(1); // reset to page 1
            setIsFilterOpen(false);
          }}
          onReset={() => {
            setFilters({
              vendor: '',
              code: '',
              nomor_surat_jalan: '',
              nomor_plat_mobil: '',
              qty: '',
              qty_now: '',
              driver: '',
              tujuan_awal: '',
            });
            setPage(1);
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </div>
  );
} 