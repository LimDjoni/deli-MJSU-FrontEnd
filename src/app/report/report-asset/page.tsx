'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { MJSUAPI } from '@/api';
import { RootState } from '@/redux/store'; // adjust import based on your structure  
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import ErrorMessage from '@/components/ErrorMessage';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { RangkumanAsset, RangkumanAssetForm } from '@/types/AssetValues';

export default function RangkumanStockFuelPage() {
  const [mode, setMode] = useState<'preview' | 'submit'>('preview');
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [showTable, setShowTable] = useState(false); 
  const [stockFuelList, setStockFuelList] = useState<RangkumanAsset[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RangkumanAssetForm>({
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
 
  const onPreview: SubmitHandler<RangkumanAssetForm> = async (formData) => {
    setShowTable(true);
    setMode('submit');
    await fetchData(formData.month);
  };

   const onSubmit: SubmitHandler<RangkumanAssetForm> = async (formData) => {
      // Keep mode on submit so button text doesn't revert
      setMode('submit');
      const allData = await fetchDataExport(formData.month); 
      exportAssetToExcel(allData);
  }; 
  
  const exportAssetToExcel = (data: RangkumanAsset[]) => {  
    // 1. Prepare table data
    const wsData = data.map((item, index) => [
      index + 1,
      item.ukuran === "-" ? item.asset_type : `${item.asset_type} - ${item.ukuran}`,
      item.stock,
      item.jumlah_barang_masuk,
      item.jumlah_barang_keluar, 
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Format month-year for B3
    const monthYear = watchedMonth
      ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(watchedMonth)
      : '';

    // 2. Add title
    XLSX.utils.sheet_add_aoa(worksheet, [['Report Asset Report']], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheet, [[`Bulan: ${monthYear}`]], { origin: 'B3' });
    

    XLSX.utils.sheet_add_aoa(worksheet, [[`Bulan: ${monthYear}`]], { origin: 'B3' });

    // 3. Add header rows
    // Row 5: Group header for Penerimaan Solar
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        [
          'No',
          'Asset',
          'Stock',
          'Jumlah Barang Masuk',
          'Jumlah Barang Keluar',
        ],
      ],
      { origin: 'B5' }
    ); 

    // 4. Add table data below headers (starts at Row 6)
    XLSX.utils.sheet_add_aoa(worksheet, wsData, { origin: 'B6' });

    // 5. Define merges
    worksheet['!merges'] = [
      // Title merge
      { s: { r: 1, c: 1 }, e: { r: 1, c: 5 } }, // B2:F2 
      { s: { r: 2, c: 1 }, e: { r: 2, c: 5 } }, // B3:F3
    ];

    // 6. Style title
    if (!worksheet['B2']) worksheet['B2'] = { t: 's', v: '' };
    worksheet['B2'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    if (!worksheet['B3']) worksheet['B3'] = { t: 's', v: '' };
    worksheet['B3'].s = {
      font: { bold: true, sz: 10 },
      alignment: { horizontal: 'center', vertical: 'center' },
    };

    // 7. Style headers
    const headerCells = [
      'B5','C5','D5','E5','F5',
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
      { wch: 30 },    // C - Date
      { wch: 30 },    // D - First Stock
      { wch: 30 },    // E - Day
      { wch: 30 },    // F - Night 
    ];

    // 9. Create workbook and save
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Asset');

    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const date = new Date().toISOString().split('T')[0];
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `Asset_${date}.xlsx`);
  };

 const fetchData = useCallback(
  async (selectedMonth: Date | null): Promise<RangkumanAsset[]> => {
    try {
      if (!selectedMonth) return []; // ✅ return array kosong agar konsisten

      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        month: formatToLocalTime(selectedMonth.toISOString()),
      }).toString();

      const response = await MJSUAPI({
        url: `/asset/list/rangkuman?${query}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API raw response:", response.data);

      // update state seperti biasa
      const data = response.data || [];
      setStockFuelList(data.data); 
      setTotalPages(data.total_pages || 1);

      return data; // ✅ penting! sekarang fungsi mengembalikan data
    } catch (error) {
      console.error("Failed to fetch fuel summary:", error);
      return []; // ✅ return array kosong saat error
    }
  },
  [token, page, limit]
);


 const fetchDataExport = useCallback(
  async (selectedMonth: Date | null): Promise<RangkumanAsset[]> => {
    try {
      if (!selectedMonth) return []; // ✅ return array kosong agar konsisten

      const query = new URLSearchParams({ 
        month: formatToLocalTime(selectedMonth.toISOString()),
      }).toString();

      const response = await MJSUAPI({
        url: `/asset/export?${query}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API raw response:", response.data);

      // update state seperti biasa
      const data = response.data || []; 

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
        <ContentHeader className="m-0" title="Rangkuman Report Asset" />
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
                <th rowSpan={2} className="px-4 py-2">Asset</th>
                <th rowSpan={2} className="px-4 py-2">Total Stock</th>
                <th rowSpan={2} className="px-4 py-2">Jumlah Barang Masuk</th>
                <th rowSpan={2} className="px-4 py-2">Jumlah Barang Keluar</th> 
              </tr> 
            </thead>
            <tbody>
              {Array.isArray(stockFuelList) && stockFuelList.length > 0 ? (
                stockFuelList.map((data, index) => (
                  <tr key={`${index}`} className="border-t text-center">
                    <td className="px-4 py-2">{index + 1}</td> 
                    <td className="px-4 py-2">
                      {data.ukuran === "-" 
                        ? data.asset_type 
                        : `${data.asset_type} - ${data.ukuran}` || '-'}
                    </td>
                    <td className="px-4 py-2">{Number(data.stock).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2">{Number(data.jumlah_barang_masuk).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2">{Number(data.jumlah_barang_keluar).toLocaleString('id-ID')}</td> 
                  </tr> 
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center">
                    Tidak ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div> 
        <div className="flex justify-end items-center mt-4 space-x-2">
        <button
          type='button'
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
              type='button'
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
          type='button'
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      </>
      )}
    </form>
  );
}
