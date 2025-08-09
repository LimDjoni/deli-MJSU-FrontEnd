'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store'; // adjust import based on your structure  
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import ErrorMessage from '@/components/ErrorMessage';

type RangkumanStockFuelForm = {
  month: Date | null;
};

export interface StockFuelSummary {  
	report_date: Date | string;
	date: Date | string;
	first_stock: number;
	day: number;
	night: number;
	total: number;
	grand_total: number;
	fuel_in: number;
	end_stock: number;
	mtd_consump: number;
	plan_permintaan: number;
	mjsu: number;
	ppp: number;
	sadp: number;
	btp: number;
	surplus: number;
}

export default function RangkumanStockFuelPage() {
  const [mode, setMode] = useState<'preview' | 'submit'>('preview');
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [showTable, setShowTable] = useState(false); 
  const [stockFuelList, setStockFuelList] = useState<StockFuelSummary[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RangkumanStockFuelForm>({
    mode: 'onSubmit',
    defaultValues: {
      month: new Date(new Date().setHours(0, 0, 0, 0)), 
    },
  }); 
  
  const handleClick = () => {
    if (mode === 'preview') {
      handleSubmit(onPreview)();
    } else {
      // handleSubmit(onSubmit)();
    }
  }; 
  
  // Watch month
  const watchedMonth = watch('month');

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
  };
 
  const onPreview: SubmitHandler<RangkumanStockFuelForm> = async (formData) => {
    setShowTable(true);
    setMode('submit');
    await fetchData(formData.month);
  };

  const fetchData = useCallback(
    async (selectedMonth: Date | null) => {
      try {
        if (!selectedMonth) return;

        const query = new URLSearchParams({
          month: formatToLocalTime(selectedMonth.toISOString()),
        }).toString();

        const response = await MrpAPI({
          url: `/stockfuel/list/summary?${query}`,
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API raw response:", response.data);
        setStockFuelList(response.data || []);
      } catch (error) {
        console.error("Failed to fetch fuel summary:", error);
      }
    },
    [token]
  );
 
   // Fetch data automatically when month changes
  useEffect(() => {
    if (watchedMonth) {
      fetchData(watchedMonth);
    }
  }, [watchedMonth, fetchData]);

  useEffect(() => {
    console.log(stockFuelList);
  }, [stockFuelList]);

  return (
    <form>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Rangkuman Stock Fuel" />
        <ButtonAction type="button" className="px-6" onClick={handleClick}>
          {mode === 'preview' ? 'Preview' : 'Download'}
        </ButtonAction>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 grid grid-cols-3 items-start gap-4">
          <label className="text-left font-medium pt-2">Bulan Report :</label>
          <Controller
            control={control}
            name="month"
            rules={{ required: 'Bulan Wajib di Pilih' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                dateFormat="MMMM yyyy"       // display month + year
                showMonthYearPicker          // restrict picker to month + year
                className="w-75 border rounded px-3 py-2"
                placeholderText="Pilih Bulan"
                minDate={new Date('2024-01-01')}
              />
            )}
          />
          <ErrorMessage>{errors.month?.message}</ErrorMessage>
        </div> 
      </div>

      {showTable && (
        <>
        <div className="overflow-x-auto bg-white rounded-xl shadow mt-6">
          <table id="fuel-table" className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FF3131] text-white text-center">
                <th rowSpan={2} className="px-4 py-2">No</th>
                <th rowSpan={2} className="px-4 py-2">Date</th>
                <th rowSpan={2} className="px-4 py-2">First Stock</th>
                <th rowSpan={2} className="px-4 py-2">Day</th>
                <th rowSpan={2} className="px-4 py-2">Night</th>
                <th rowSpan={2} className="px-4 py-2">Total</th>
                <th rowSpan={2} className="px-4 py-2">Grand Total</th>
                <th rowSpan={2} className="px-4 py-2">Fuel In</th>
                <th rowSpan={2} className="px-4 py-2">End Stock</th>
                <th rowSpan={2} className="px-4 py-2">MTD Consump</th>
                <th rowSpan={2} className="px-4 py-2">Plan Penerimaan Solar</th>
                <th colSpan={3} className="px-4 py-2">Permintaan Solar</th>
              </tr>
              <tr className="bg-[#FF3131] text-white text-center">
                <th className="px-4 py-2">MJSU</th>
                <th className="px-4 py-2">PPP</th>
                <th className="px-4 py-2">SADP</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(stockFuelList) && stockFuelList.length > 0 ? (
                stockFuelList.map((data, index) => (
                  <tr key={`${index}`} className="border-t text-center">
                    <td>{index + 1}</td>
                    <td>{data.date as string}</td>
                    <td>{Number(data.first_stock).toLocaleString('id-ID')}</td>
                    <td>{Number(data.day).toLocaleString('id-ID')}</td>
                    <td>{Number(data.night).toLocaleString('id-ID')}</td>
                    <td>{Number(data.total).toLocaleString('id-ID')}</td>
                    <td>{Number(data.grand_total).toLocaleString('id-ID')}</td>
                    <td>{Number(data.fuel_in).toLocaleString('id-ID')}</td>
                    <td>{Number(data.end_stock).toLocaleString('id-ID')}</td>
                    <td>{Number(data.mtd_consump).toLocaleString('id-ID')}</td>
                    <td>{Number(data.plan_permintaan).toLocaleString('id-ID') || '-'}</td> 
                    <td>{Number(data.mjsu).toLocaleString('id-ID') || '-'}</td> 
                    <td>{Number(data.ppp).toLocaleString('id-ID') || '-'}</td> 
                    <td>{Number(data.sadp).toLocaleString('id-ID') || '-'}</td> 
                  </tr> 
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-2 text-center">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> 
      </>
      )}
    </form>
  );
}
