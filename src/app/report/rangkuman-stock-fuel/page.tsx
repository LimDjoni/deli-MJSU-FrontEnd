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
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

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
      handleSubmit(onSubmit)();
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

   const onSubmit: SubmitHandler<RangkumanStockFuelForm> = async (formData) => {
      const allData = await fetchData(formData.month);
      console.log(allData);
      exportStockRatioToExcel(allData);
  }; 
  
  const exportStockRatioToExcel = (data: StockFuelSummary[]) => {  
    // 1. Prepare table data
    const wsData = data.map((item, index) => [
      index + 1,
      item.date,
      item.first_stock,
      item.day,
      item.night,
      item.total,
      item.grand_total,
      item.fuel_in,
      item.end_stock,
      item.mtd_consump,
      item.plan_permintaan,
      item.mjsu,
      item.ppp,
      item.sadp,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // 2. Add title
    XLSX.utils.sheet_add_aoa(worksheet, [['Stock Fuel Report']], { origin: 'B2' });

    // 3. Add header rows
    // Row 5: Group header for Penerimaan Solar
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          'No',
          'Date',
          'First Stock',
          'Day',
          'Night',
          'Total',
          'Grand Total',
          'Fuel In',
          'End Stock',
          'MTD Consumption',
          'Plan Penerimaan Solar',
          'Penerimaan Solar', // merged header for MJSU, PPP, SADP
          '',
          '',
        ],
      ],
      { origin: 'B4' }
    );

    // Row 6: Sub headers under Penerimaan Solar
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          'MJSU',
          'PPP',
          'SADP',
        ],
      ],
      { origin: 'B5' }
    );

    // 4. Add table data below headers (starts at Row 6)
    XLSX.utils.sheet_add_aoa(worksheet, wsData, { origin: 'B6' });

    // 5. Define merges
    worksheet['!merges'] = [
      // Title merge
      { s: { r: 1, c: 1 }, e: { r: 1, c: 14 } }, // B2:O2

      // Penerimaan Solar merged header
      { s: { r: 3, c: 12 }, e: { r: 3, c: 14 } }, // M5:O5

      // Merge main headers that don't have sub-headers
      { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } }, // B5:B6 No
      { s: { r: 3, c: 2 }, e: { r: 4, c: 2 } }, // C5:C6 Date
      { s: { r: 3, c: 3 }, e: { r: 4, c: 3 } }, // D5:D6 First Stock
      { s: { r: 3, c: 4 }, e: { r: 4, c: 4 } }, // E5:E6 Day
      { s: { r: 3, c: 5 }, e: { r: 4, c: 5 } }, // F5:F6 Night
      { s: { r: 3, c: 6 }, e: { r: 4, c: 6 } }, // G5:G6 Total
      { s: { r: 3, c: 7 }, e: { r: 4, c: 7 } }, // H5:H6 Grand Total
      { s: { r: 3, c: 8 }, e: { r: 4, c: 8 } }, // I5:I6 Fuel In
      { s: { r: 3, c: 9 }, e: { r: 4, c: 9 } }, // J5:J6 End Stock
      { s: { r: 3, c: 10 }, e: { r: 4, c: 10 } }, // K5:K6 MTD Consumption
      { s: { r: 3, c: 11 }, e: { r: 4, c: 11 } }, // L5:L6 Plan Penerimaan Solar
    ];

    // 6. Style title
    if (!worksheet['B2']) worksheet['B2'] = { t: 's', v: '' };
    worksheet['B2'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    // 7. Style headers
    const headerCells = [
      'B4','C4','D4','E4','F4','G4','H4','I4','J4','K4','L4','M4','N4','O4',
      'B5','C5','D5','E5','F5','G5','H5','I5','J5','K5','L5','M5','N5','O5',
    ];

    headerCells.forEach((cell) => {
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'FF3131' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    });

    // 8. Adjust column widths
    worksheet['!cols'] = [
      { wch: 0 },     // A (empty)
      { wch: 5 },     // B - No
      { wch: 20 },    // C - Date
      { wch: 15 },    // D - First Stock
      { wch: 12 },    // E - Day
      { wch: 12 },    // F - Night
      { wch: 12 },    // G - Total
      { wch: 15 },    // H - Grand Total
      { wch: 15 },    // I - Fuel In
      { wch: 15 },    // J - End Stock
      { wch: 20 },    // K - MTD Consumption
      { wch: 25 },    // L - Plan Penerimaan Solar
      { wch: 12 },    // M - MJSU
      { wch: 12 },    // N - PPP
      { wch: 12 },    // O - SADP
    ];

    // 9. Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Fuel');

    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const date = new Date().toISOString().split('T')[0];
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `FuelStock_${date}.xlsx`);
  };

 const fetchData = useCallback(
  async (selectedMonth: Date | null): Promise<StockFuelSummary[]> => {
    try {
      if (!selectedMonth) return []; // ✅ return array kosong agar konsisten

      const query = new URLSearchParams({
        month: formatToLocalTime(selectedMonth.toISOString()),
      }).toString();

      const response = await MrpAPI({
        url: `/stockfuel/list/summary?${query}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API raw response:", response.data);

      // update state seperti biasa
      const data = response.data || [];
      setStockFuelList(data);

      return data; // ✅ penting! sekarang fungsi mengembalikan data
    } catch (error) {
      console.error("Failed to fetch fuel summary:", error);
      return []; // ✅ return array kosong saat error
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
                  <td colSpan={15} className="px-4 py-2 text-center">
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
