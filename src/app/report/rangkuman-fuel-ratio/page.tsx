'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ContentHeader from '@/components/ContentHeader';
import ButtonAction from '@/components/ButtonAction';
import ErrorMessage from '@/components/ErrorMessage';
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store'; // adjust import based on your structure 
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

type RangkumanFuelRatioForm = {
  first_hm: Date | null;
  last_hm: Date | null;
};

export interface FuelRatioSummary {
  Field: string;
  Sort: string;
  UnitID: string;
  UnitName: string;
  Shift: string;
  TotalRefill: number;
  Consumption: string;
  Tolerance: string;
  FirstHM: string;
  LastHM: string;
  ID: number;
  status: string;
  Duration: string;
  BatasAtas: number;
  BatasBawah: number;
  TotalKonsumsiBBM : string;
}

export default function RangkumanPage() {
  const [mode, setMode] = useState<'preview' | 'submit'>('preview');
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [showTable, setShowTable] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState<string>('unit_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fuelRatioList, setFuelRatioList] = useState<FuelRatioSummary[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RangkumanFuelRatioForm>({
    mode: 'onSubmit',
    defaultValues: {
      first_hm: new Date(new Date().setHours(0, 0, 0, 0)),
      last_hm: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });

  const onPreview = async () => {
    setShowTable(true);
    setMode('submit');
    await fetchData();
  };

  const onSubmit = async () => {
    const allData = await fetchAllData(); // fetches full dataset
    console.log(allData);
    exportFuelRatioToExcelWithColor(allData);
  };

   const fetchAllData = async (): Promise<FuelRatioSummary[]> => {
    try {
      const firstHM = watch('first_hm')?.toISOString() ?? '';
      const lastHM = watch('last_hm')?.toISOString() ?? '';

      const query = new URLSearchParams({
        field: sortField,
        sort: sortDirection,
        first_hm: formatToLocalTime(firstHM),
        lastHM: formatToLocalTime(lastHM),
      }).toString();

      const response = await MrpAPI({
        url: `/fuelratio/list/summary?${query}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      return [];
    }
  };

  const exportFuelRatioToExcelWithColor = (data: FuelRatioSummary[]) => {
    const firstHM = watch('first_hm')?.toISOString() ?? '';
    const lastHM = watch('last_hm')?.toISOString() ?? '';

    const wsData = [
      ['No', 'Nama Unit', 'Shift', 'Konsumsi BBM/h', 'Total Refill', 'Duration', 'Total Konsumsi BBM', 'Status'],
      ...data.map((item, index) => {
        const statusText =
          Number(item.TotalRefill) > Number(item.BatasAtas)
            ? 'Melewati Batas Atas'
            : 'Aman';
        return [
          index + 1,
          item.UnitName,
          item.Shift,
          `1 : ${item.Consumption}`,
          item.TotalRefill,
          item.Duration,
          item.TotalKonsumsiBBM,
          statusText,
        ];
      }),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Title
    XLSX.utils.sheet_add_aoa(worksheet, [['Fuel Ratio Report']], { origin: 'B1' });

    // Dates
    XLSX.utils.sheet_add_aoa(worksheet, [
      [`${formatToLocalTime(firstHM)} - ${formatToLocalTime(lastHM)}`]
    ], { origin: 'B2' }); 

    // Table data
    XLSX.utils.sheet_add_aoa(worksheet, wsData, { origin: 'B4' });

    // Merges: Title and date rows
    worksheet['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 8 } }, // B1:H1
      { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } }, // B2:H2
    ];

    // Style for title and dates
    ['B1'].forEach((cell) => {
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
      worksheet[cell].s = {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: 'center' },
      };
    });

    // Style for title and dates
    ['B2'].forEach((cell) => {
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
      worksheet[cell].s = {
        font: { bold: true, sz: 12 },
        alignment: { horizontal: 'center' },
      };
    });

    // Style the header row (Row 4)
    const headerCells = ['B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4'];
    headerCells.forEach((cell) => {
      if (!worksheet[cell]) worksheet[cell] = { t: 's', v: '' };
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'FF3131' } },
        alignment: { horizontal: 'center' },
      };
    });

    // Color the Status column (starting row 5 → column H)
    data.forEach((item, index) => {
      const rowNum = index + 5; // Starts from B5, so data starts at row 5
      const cellRef = `I${rowNum}`;
      const refill = Number(item.TotalRefill);
      const bawah = Number(item.BatasBawah);
      const atas = Number(item.BatasAtas);

      const color =
        refill > atas ? 'FF0000' : refill < bawah ? '00FF00' : 'FFFF00'; // red, green, yellow

      if (!worksheet[cellRef]) {
        worksheet[cellRef] = { t: 's', v: '' }; // Ensure cell exists
      }

      worksheet[cellRef].s = {
        fill: {
          patternType: 'solid',
          fgColor: { rgb: color },
        },
      };
    });

    // Column widths (starting from B → index 1)
    worksheet['!cols'] = [
      { wch: 0 },     // A (empty)
      { wch: 5 },     // B - No
      { wch: 20 },    // C - Nama Unit
      { wch: 10 },    // D - Shift
      { wch: 15 },    // E - Konsumsi BBM/h
      { wch: 15 },    // F - Total Refill
      { wch: 15 },    // G - Duration
      { wch: 20 },    // G - Duration
      { wch: 15 },    // H - Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel Ratio');

    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const date = new Date().toISOString().split('T')[0];
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `FuelRatio_${date}.xlsx`);
  };


  const handleClick = () => {
    if (mode === 'preview') {
      handleSubmit(onPreview)();
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatToLocalTime = (isoString: string) => {
    const date = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const firstHM = watch('first_hm')?.toISOString() ?? '';
  const lastHM = watch('last_hm')?.toISOString() ?? '';

  const fetchData  = useCallback(async () => {
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        field: sortField,
        sort: sortDirection,
        first_hm: formatToLocalTime(firstHM || ''),
        lastHM: formatToLocalTime(lastHM || ''), 
      }).toString();

      const response = await MrpAPI({
        url: `/fuelratio/list/summary/pagination?${query}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = response.data;
      setFuelRatioList(res.data || []);
      setTotalPages(res.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch fuel ratio:', error);
    }
  }, [firstHM, lastHM, page, limit, sortField, sortDirection, token]); 
  
  useEffect(() => {
    if (token && showTable) fetchData();
  }, [token, fetchData, showTable]);

  return (
    <form>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Rangkuman Fuel Ratio" />
        <ButtonAction type="button" className="px-6" onClick={handleClick}>
          {mode === 'preview' ? 'Preview' : 'Download'}
        </ButtonAction>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3 grid grid-cols-3 items-start gap-4">
          <label className="text-left font-medium pt-2">Tanggal Report Dari :</label>
          <Controller
            control={control}
            name="first_hm"
            rules={{ required: 'HM Awal wajib diisi' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-75 border rounded px-3 py-2"
                placeholderText="Pilih Tanggal & Waktu"
                minDate={new Date('2024-01-01')}
              />
            )}
          />
          <ErrorMessage>{errors.first_hm?.message}</ErrorMessage>
        </div>

        <div className="col-span-3 grid grid-cols-3 items-start gap-4">
          <label className="text-left font-medium pt-2">Tanggal Report Sampai :</label>
          <Controller
            control={control}
            name="last_hm"
            rules={{ required: 'HM Akhir wajib diisi' }}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-75 border rounded px-3 py-2"
                placeholderText="Pilih Tanggal & Waktu"
                minDate={new Date('2024-01-01')}
              />
            )}
          />
          <ErrorMessage>{errors.last_hm?.message}</ErrorMessage>
        </div>
      </div>

      {showTable && (
        <>
        <div className="overflow-x-auto bg-white rounded-xl shadow mt-6">
          <table id="fuel-table" className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FF3131] text-white text-center">
                <th className="px-4 py-2">No</th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('unit_name')}>
                  Nama Unit {sortField === 'unit_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('shift')}>
                  Shift {sortField === 'shift' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('consumption')}>
                  Konsumsi BBM/h {sortField === 'consumption' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('total_refill')}>
                  Total Refill {sortField === 'total_refill' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('duration')}>
                  Duration {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th> 
                <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('total_konsumsi_bbm')}>
                  Total Konsumsi BBM {sortField === 'total_konsumsi_bbm' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th> 
                <th className="px-4 py-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {fuelRatioList.length > 0 ? (
                fuelRatioList.map((data, index) => (
                    <tr key={data.ID ?? `${index}`} className="border-t text-center">
                      <td>
                        {(page - 1) * limit + index + 1}
                      </td>
                    <td className="px-4 py-2">{data.UnitName}</td>
                    <td className="px-4 py-2">{data.Shift}</td>
                    <td className="px-4 py-2">1 : {data.Consumption}</td>
                    <td className="px-4 py-2">{data.TotalRefill}</td>
                    <td className="px-4 py-2">{data.Duration}</td>
                    <td className="px-4 py-2">{data.TotalKonsumsiBBM}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-block w-5 h-5 ${
                          data.TotalRefill >= data.BatasAtas ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      ></span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="no-data">
                  <td colSpan={8} className="px-4 py-2 text-center">
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

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Status Rangkuman Fuel Ratio</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-sm" />
            <span>Aman</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-sm" />
            <span>Melewati Batas Toleransi</span>
          </div>
        </div>
      </div>
      </>
      )}
    </form>
  );
}
