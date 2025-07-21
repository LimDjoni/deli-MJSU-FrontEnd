'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; 

import ContentHeader from "@/components/ContentHeader";
import { MrpAPI } from '@/api';
import { DashboardEmployeeKontrak, DohExpired, MCUBerkala} from '@/types/DashboardValues';
import BottomSummary from './Data/BottomSummary';
import ButtonAction from '@/components/ButtonAction';
import { Funnel } from 'lucide-react';
import FilterModal from '@/components/Modal';
import FilterFormPage from './FilterFormPage';

export default function HRGADashboard() { 
    const router = useRouter();
    const token = useSelector((state: RootState) => state.auth.user?.token);
  	const code_emp = useSelector((state: RootState) => state.auth.user?.CodeEmp);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [limit] = useState(10);
    const [pageDOH, setPageDOH] = useState(1);
    const [totalPagesDOH, setTotalPagesDOH] = useState(1);
    const [sortFieldDOH, setSortFieldDOH] = useState<string>('');
    const [sortDirectionDOH, setSortDirectionDOH] = useState<'asc' | 'desc'>('asc');
    const [dohList, setDOHList] = useState<DohExpired[]>([]); 
	const [filters, setFilters] = useState({
	pt: '',
	year: '', 
	});

    const [pageMCU, setPageMCU] = useState(1);
    const [totalPagesMCU, setTotalPagesMCU] = useState(1);
    const [sortFieldMCU, setSortFieldMCU] = useState<string>('');
    const [sortDirectionMCU, setSortDirectionMCU] = useState<'asc' | 'desc'>('asc');
	const [detail, setDetail] = useState<DashboardEmployeeKontrak| null>(null);
    const [mcuList, setMCUList] = useState<MCUBerkala[]>([]);

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
	
			const response = await MrpAPI({
			  url: `/employee/list/dashboardKontrak/${code_emp}?${query}`,
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

    useEffect(() => {
        const fetchData = async () => {
        try {
            const query = new URLSearchParams({
            page: pageDOH.toString(),
            limit: limit.toString(),
            field: sortFieldDOH,
            sort: sortDirectionDOH,  
			...Object.fromEntries(
				Object.entries(filters).filter(([, value]) => value !== '' && value !== '0')
			),
            }).toString();

            const response = await MrpAPI({
            url: `/master/list/expireddoh?${query}&code_emp=${code_emp}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            const res = response.data; 
            setDOHList(res.data);
            setTotalPagesDOH(res.total_pages);
        } catch (error) {
            console.error('Failed to fetch alat berat:', error);
        }
        };

        if (token) fetchData();
    }, [token, filters, pageDOH, sortFieldDOH, sortDirectionDOH, limit]);

	useEffect(() => {
        const fetchData = async () => {
        try {
            const query = new URLSearchParams({
            page: pageMCU.toString(),
            limit: limit.toString(),
            field: sortFieldMCU,
            sort: sortDirectionMCU, 
			...Object.fromEntries(
				Object.entries(filters).filter(([, value]) => value !== '' && value !== '0')
			),
            }).toString();

            const response = await MrpAPI({
            url: `/master/list/mcuberkala?${query}&code_emp=${code_emp}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });

            const res = response.data; 
			console.log(res);
            setMCUList(res.data);
            setTotalPagesMCU(res.total_pages);
        } catch (error) {
            console.error('Failed to fetch alat berat:', error);
        }
        };

        if (token) fetchData();
    }, [token, filters, pageMCU, sortFieldMCU, sortDirectionMCU, limit]);


	const handleSortDOH = (field: string) => {
		if (sortFieldDOH === field) {
			setSortDirectionDOH((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortFieldDOH(field);
			setSortDirectionDOH('asc');
		}
	}

	const handleSortMCU = (field: string) => {
		if (sortFieldMCU === field) {
			setSortDirectionMCU((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortFieldMCU(field);
			setSortDirectionMCU('asc');
		}
	}


  return ( 
    <>
	<div className="flex flex-row justify-between">
      <ContentHeader className="!text-start" title="Dashboard Kontrak" /> 
      <ButtonAction
          className="px-2"
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={24} />}
        >
          Filter
      </ButtonAction>
    </div>
	<BottomSummary data={detail} />
	<div className="w-full overflow-x-hidden">
		<div className="flex flex-col lg:flex-row gap-6 w-full">  
			<div id='section-kontrak'className="w-full lg:w-1/2">
				<h2 className="text-gray-700">Kontrak</h2>
				<div className="overflow-x-auto bg-white rounded-xl shadow">
					<table className="min-w-full text-left border-collapse">
					<thead>
						<tr className="bg-[#FF3131] text-white text-center">
						<th className="px-4 py-2">No</th>
						<th className="px-4 py-2 cursor-pointer" onClick={() => handleSortDOH('firstname')}>
							Nama Employee {sortFieldDOH === 'firstname' && (sortDirectionDOH === 'asc' ? '↑' : '↓')}
						</th>
						<th className="px-4 py-2 cursor-pointer" onClick={() => handleSortDOH('tanggal_doh')}>
							Tanggal Mulai Kontrak {sortFieldDOH === 'tanggal_doh' && (sortDirectionDOH === 'asc' ? '↑' : '↓')}
						</th>
						<th className="px-4 py-2 cursor-pointer" onClick={() => handleSortDOH('tanggal_end_doh')}>
							Tanggal Berakhir Kontrak {sortFieldDOH === 'tanggal_end_doh' && (sortDirectionDOH === 'asc' ? '↑' : '↓')}
						</th> 
						</tr>
					</thead>
					<tbody>
					{[...Array(10)].map((_, index) => {
						const item = dohList?.[index]; // Get item if it exists
						return item ? (
						<tr key={item.id} className="border-t text-center mt-6">
							<td
							className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
							onClick={() => router.push(`/hr/employee/detail/${item.employee_id}`)}
							>
							{(pageDOH - 1) * limit + index + 1}
							</td>
							<td>
							<div className="!text-start font-semibold">
								{item.firstname} {item.lastname}
							</div>
							<div className="flex flex-row">
								<div className="text-sm text-gray-500">
								{item.department_name} - {item.position_name}
								</div>
							</div>
							</td>
							<td className="px-4 py-2">{item.tanggal_doh as string}</td>
							<td className="px-4 py-2">{item.tanggal_end_doh as string}</td>
						</tr>
						) : (
						<tr key={`empty-${index}`} className="border-t text-center mt-6">
							<td className="px-4 py-2 text-gray-400">-</td>
							<td className="px-4 py-2 text-gray-400">-</td>
							<td className="px-4 py-2 text-gray-400">-</td>
							<td className="px-4 py-2 text-gray-400">-</td>
						</tr>
						);
					})}
					</tbody>
					</table>
				</div>

				<div className="flex justify-end items-center mt-4 space-x-2">
					<button
					onClick={() => setPageDOH((prev) => Math.max(prev - 1, 1))}
					disabled={pageDOH === 1}
					className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
					>
					Prev
					</button>

					{[...Array(totalPagesDOH)].map((_, i) => {
					const pageNum = i + 1;

					const maxVisible = 5;
					const half = Math.floor(maxVisible / 2);
					let start = Math.max(1, pageDOH - half);
					let end = start + maxVisible - 1;

					if (end > totalPagesDOH) {
						end = totalPagesDOH;
						start = Math.max(1, end - maxVisible + 1);
					}

					// Skip pages outside visible range
					if (pageNum < start || pageNum > end) return null;

					return (
						<button
						key={pageNum}
						onClick={() => setPageDOH(pageNum)}
						className={`px-3 py-1 rounded ${
							pageDOH === pageNum
							? 'bg-red-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
						>
						{pageNum}
						</button>
					);
					})}

					<button
					onClick={() => setPageDOH((prev) => Math.min(prev + 1, totalPagesDOH))}
					disabled={pageDOH === totalPagesDOH}
					className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
					>
					Next
					</button>
				</div>
			</div>
			
			<div id='section-mcu'className="w-full lg:w-1/2">
				<h2 className="text-gray-700">MCU</h2>
				<div className="overflow-x-auto bg-white rounded-xl shadow">
					<table className="min-w-full text-left border-collapse">
					<thead>
						<tr className="bg-[#FF3131] text-white text-center">
						<th className="px-4 py-2">No</th>
						<th className="px-4 py-2 cursor-pointer" onClick={() => handleSortMCU('firstname')}>
							Nama Employee {sortFieldMCU === 'firstname' && (sortDirectionMCU === 'asc' ? '↑' : '↓')}
						</th>
						<th className="px-4 py-2 cursor-pointer" onClick={() => handleSortMCU('date_mcu')}>
							Tanggal Pelaksanaan MCU {sortFieldMCU === 'date_mcu' && (sortDirectionMCU === 'asc' ? '↑' : '↓')}
						</th>
						<th className="px-4 py-2 cursor-pointer" onClick={() => handleSortMCU('date_end_mcu')}>
							Tanggal MCU Berikutnya {sortFieldMCU === 'date_end_mcu' && (sortDirectionMCU === 'asc' ? '↑' : '↓')}
						</th> 
						</tr>
					</thead>
					<tbody>
					{[...Array(10)].map((_, index) => {
						const item = mcuList?.[index]; // get data if available
						return item ? (
						<tr key={item.id} className="border-t text-center mt-6">
							<td
							className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
							onClick={() => router.push(`/hr/employee/detail/${item.employee_id}`)}
							>
							{(pageMCU - 1) * limit + index + 1}
							</td>
							<td>
							<div className="!text-start font-semibold">
								{item.firstname} {item.lastname}
							</div>
							<div className="flex flex-row">
								<div className="text-sm text-gray-500">
								{item.department_name} - {item.position_name}
								</div>
							</div>
							</td>
							<td className="px-4 py-2">{item.date_mcu as string}</td>
							<td className="px-4 py-2">{item.date_end_mcu as string}</td>
						</tr>
						) : (
						<tr key={`empty-${index}`} className="border-t text-center mt-6">
							<td className="px-4 py-2 text-gray-400">-</td>
							<td className="px-4 py-2 text-gray-400">-</td>
							<td className="px-4 py-2 text-gray-400">-</td>
							<td className="px-4 py-2 text-gray-400">-</td>
						</tr>
						);
					})}
					</tbody> 
					</table>
				</div>

				<div className="flex justify-end items-center mt-4 space-x-2">
					<button
					onClick={() => setPageMCU((prev) => Math.max(prev - 1, 1))}
					disabled={pageMCU === 1}
					className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
					>
					Prev
					</button>

					{[...Array(totalPagesMCU)].map((_, i) => {
					const pageNum = i + 1;

					const maxVisible = 5;
					const half = Math.floor(maxVisible / 2);
					let start = Math.max(1, pageMCU - half);
					let end = start + maxVisible - 1;

					if (end > totalPagesMCU) {
						end = totalPagesMCU;
						start = Math.max(1, end - maxVisible + 1);
					}

					// Skip pages outside visible range
					if (pageNum < start || pageNum > end) return null;

					return (
						<button
						key={pageNum}
						onClick={() => setPageMCU(pageNum)}
						className={`px-3 py-1 rounded ${
							pageMCU === pageNum
							? 'bg-red-500 text-white'
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
						}`}
						>
						{pageNum}
						</button>
					);
					})}

					<button
					onClick={() => setPageMCU((prev) => Math.min(prev + 1, totalPagesMCU))}
					disabled={pageMCU === totalPagesMCU}
					className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
					>
					Next
					</button>
				</div>
			</div>
		</div>
	</div>

	<FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
      <FilterFormPage
        onApply={(values) => {
          setFilters({
            pt: values.pt?.join(',') || '',
            year: values.year || '',
          });
          setIsFilterOpen(false);
        }}
        onReset={() => {
          setFilters({
            pt: '',
            year: '',
          });
          setIsFilterOpen(false);
        }}
      />
    </FilterModal> 

    </>
  );
}