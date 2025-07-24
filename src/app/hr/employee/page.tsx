'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import ContentHeader from '@/components/ContentHeader';
import ButtonAction from '@/components/ButtonAction';
import { Funnel, Plus } from 'lucide-react';
import FilterModal from '@/components/Modal';
import FilterForm from '@/app/hr/employee/FilterForm';
import { MrpAPI } from '@/api';
import { EmployeeAddDetailEditFormValue, EmployeeHomeFormValues } from '@/types/EmployeeValues';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

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

export default function EmployeePage() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const code_emp = useSelector((state: RootState) => state.auth.user?.code_emp);
  const [mounted, setMounted] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeHomeFormValues[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    nomor_karyawan: '',
    department_id: '',
    firstname: '', 
    level: '',
    code_emp: code_emp,
    position_id: '',
    hire_by: '',
    agama: '',
    gender: '',
    kategori_lokal_non_lokal: '',
    kategori_triwulan: '',
    status: '',
    kontrak: '',
    role_id: '', 
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

const createFlag = getCreateFlag(menuItems, '/hr/employee');

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
          url: `/employee/list/pagination?${query}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const res = response.data;
        setEmployeeList(res.data);
        setTotalPages(res.total_pages);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
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
  
   const onSubmit = async () => {
    const allData = await fetchAllData(); // fetches full dataset
    exportFuelRatioToExcel(allData);
  };

  const fetchAllData = async (): Promise<EmployeeAddDetailEditFormValue[]> => {
      try {   
        const response = await MrpAPI({
          url: `/employee/list/export/${code_emp}`,
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

  const exportFuelRatioToExcel = (data: EmployeeAddDetailEditFormValue[]) => {
    const now = new Date();
    const formattedNow = `Export ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const workbook = XLSX.utils.book_new();

    /** ===================== Sheet 1: Employee ===================== */
    const wsData = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Nomor Telepon', 'Email', 'Level', 'Department', 'Posisi', 'Hired By', 'Date of Hire', 'Status K3', 'Status Karyawan'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.phone_number,
        item.email,
        item.Role?.name || '',
        item.Department?.department_name || '',
        item.Position?.position_name || '',
        item.hire_by,
        item.date_of_hire,
        item.level,
        item.status,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, [['Data Employees']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheet, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheet, wsData, { origin: 'B4' });

    worksheet['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 12 } }, // Title
      { s: { r: 1, c: 1 }, e: { r: 1, c: 12 } }, // Timestamp
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheet[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee');

    /** ===================== Sheet 2: Kartu Keluarga ===================== */
    const wsDataKK = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Nomor KK', 'Nama Ibu', 'Kontak Darurat', 'Nama Kontak', 'Hubungan'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.KartuKeluarga?.nomor_kartu_keluarga || '',
        item.KartuKeluarga?.nama_ibu_kandung || '',
        item.KartuKeluarga?.kontak_darurat || '',
        item.KartuKeluarga?.nama_kontak_darurat || '',
        item.KartuKeluarga?.hubungan_kontak_darurat || '',
      ]),
    ];

    const worksheetKK = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetKK, [['Data Kartu Keluarga']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetKK, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetKK, wsDataKK, { origin: 'B4' });

    worksheetKK['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetKK[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetKK, 'Kartu Keluarga');

     /** ===================== Sheet 3: KTP ===================== */
    const wsDataKTP = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Nama Sesuai KTP', 'Nomor KTP', 'Tempat Lahir', 'Tanggal Lahir', 'Gender', 'Alamat', 'RT', 'RW', 'Kelurahan/Desa', 'Kecamatan', 'Kota/Provinsi', 'Kode Pos', 'Golongan Darah', 'Agama', 'Ring KTP'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.KTP?.nama_sesuai_ktp || '',
        item.KTP?.nomor_ktp || '',
        item.KTP?.tempat_lahir || '',
        item.KTP?.tanggal_lahir || '',
        item.KTP?.gender || '',
        item.KTP?.alamat || '',
        item.KTP?.rt || '',
        item.KTP?.rw || '',
        item.KTP?.kelurahan || '',
        item.KTP?.kecamatan || '',
        item.KTP?.kota || '',
        item.KTP?.kode_pos || '',
        item.KTP?.golongan_darah || '',
        item.KTP?.agama || '',
        item.KTP?.ring_ktp || '',
      ]),
    ];

    const worksheetKTP = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetKTP, [['Data KTP']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetKTP, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetKTP, wsDataKTP, { origin: 'B4' });

    worksheetKTP['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 18 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 18 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetKTP[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetKTP, 'KTP');

     /** ===================== Sheet 4: Pendidikan ===================== */
    const wsDataPendidikan = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Jenjang Pendidikan', 'Pendidikan Terakhir', 'Jurusan'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.Pendidikan?.pendidikan_label || '',
        item.Pendidikan?.pendidikan_terakhir || '',
        item.Pendidikan?.jurusan || '', 
      ]),
    ];

    const worksheetPendidikan = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetPendidikan, [['Data Pendidikan']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetPendidikan, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetPendidikan, wsDataPendidikan, { origin: 'B4' });

    worksheetPendidikan['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetPendidikan[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetPendidikan, 'Pendidikan');

    /** ===================== Sheet 5: Laporan ===================== */
    const wsDataLaporan = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Ring Serapan', 'Ring RIPPM', 'Kategori Laporan Triwulan', 'Kategori Lokal/Non Lokal', 'Rekomendasi'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.Laporan?.ring_serapan || '',
        item.Laporan?.ring_rippm || '',
        item.Laporan?.kategori_laporan_twiwulan || '', 
        item.Laporan?.kategori_lokal_non_lokal || '', 
        item.Laporan?.rekomendasi || '', 
      ]),
    ];

    const worksheetLaporan = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetLaporan, [['Data Laporan']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetLaporan, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetLaporan, wsDataLaporan, { origin: 'B4' });

    worksheetLaporan['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetLaporan[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetLaporan, 'Laporan');

    /** ===================== Sheet 6: APD ===================== */
    const wsDataAPD = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Ukuran Baju', 'Ukuran Celana', 'Ukuran Sepatu'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.APD?.ukuran_baju || '',
        item.APD?.ukuran_celana || '',
        item.APD?.ukuran_sepatu || '', 
      ]),
    ];

    const worksheetAPD = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetAPD, [['Data APD']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetAPD, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetAPD, wsDataAPD, { origin: 'B4' });

    worksheetAPD['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetAPD[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetAPD, 'APD');


    /** ===================== Sheet 7: Bank ===================== */
    const wsDataBank = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Nama Bank', 'Nomor Rekening', 'Nama Pemilik Bank'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.Bank?.nama_bank || '',
        item.Bank?.nomor_rekening || '',
        item.Bank?.nama_pemilik_bank || '', 
      ]),
    ];

    const worksheetBank = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetBank, [['Data Bank']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetBank, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetBank, wsDataBank, { origin: 'B4' });

    worksheetBank['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetBank[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetBank, 'Bank');

    /** ===================== Sheet 8: BPJS ===================== */
    const wsDataBPJS = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Nomor BPJS Kesehatan', 'Nomor BPJS Ketenagakerjaan'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.BPJSKesehatan?.nomor_kesehatan || '',
        item.BPJSKetenagakerjaan?.nomor_ketenagakerjaan || '', 
      ]),
    ];

    const worksheetBPJS = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetBPJS, [['Data BPJS']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetBPJS, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetBPJS, wsDataBPJS, { origin: 'B4' });

    worksheetBPJS['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 5 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetBPJS[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetBPJS, 'BPJS');

    /** ===================== Sheet 9: NPWP ===================== */
    const wsDataNPWP = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Nomor NPWP', 'Status Pajak'],
      ...data.map((item, index) => [
        index + 1,
        item.nomor_karyawan,
        `${item.firstname} ${item.lastname}`,
        item.NPWP?.nomor_npwp || '',
        item.NPWP?.status_pajak || '', 
      ]),
    ];

    const worksheetNPWP = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetNPWP, [['Data NPWP']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetNPWP, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetNPWP, wsDataNPWP, { origin: 'B4' });

    worksheetNPWP['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 5 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetNPWP[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetNPWP, 'NPWP');

    /** ===================== Sheet 10: Kontrak ===================== */
    const wsDataKontrak = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Tanggal Mulai Kontrak', 'Tanggal Kontrak Berakhir', 'Masa Kontrak', 'PT', 'Penempatan', 'Status Kontrak'],
      ...data.flatMap((item, index) => {
        if (!item.DOH || item.DOH.length === 0) {
          // If no DOH, return a single row with empty fields
          return [[
            index + 1,
            item.nomor_karyawan,
            `${item.firstname} ${item.lastname}`,
            '', '', '', '', '', ''
          ]];
        } 
        
        return item.DOH.map((doh) => {
          const start = dayjs(doh.tanggal_doh);
          const end = dayjs(doh.tanggal_end_doh).add(1, 'day');
          const months = end.diff(start, 'month');

          return [
            index + 1,
            item.nomor_karyawan,
            `${item.firstname} ${item.lastname}`,
            doh.tanggal_doh || '',
            doh.tanggal_end_doh || '',
            `${months} bulan`,
            doh.pt || '',
            doh.penempatan || '',
            doh.status_kontrak || '',
          ];
        });
      }),
    ];

    const worksheetKontrak = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetKontrak, [['Data Kontrak']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetKontrak, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetKontrak, wsDataKontrak, { origin: 'B4' });

    worksheetKontrak['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 9 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetKontrak[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetKontrak, 'Kontrak');


    /** ===================== Sheet 11: Sertifikat ===================== */
    const wsDataSertifikat = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Jenis Sertifikat', 'Tanggal Efektive', 'Keterangan'],
      ...data.flatMap((item, index) => {
        if (!item.Sertifikat || item.Sertifikat.length === 0) {
          // If no Sertifikat, return a single row with empty fields
          return [[
            index + 1,
            item.nomor_karyawan,
            `${item.firstname} ${item.lastname}`,
            '', '', ''
          ]];
        } 
         
        return item.Sertifikat.map((cert) => ([
          index + 1,
          item.nomor_karyawan,
          `${item.firstname} ${item.lastname}`,
          cert.sertifikat || '',
          cert.date_effective || '',
          cert.remark || '',
        ]));
      }),
    ];

    const worksheetSertifikat = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetSertifikat, [['Data Sertifikat']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetSertifikat, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetSertifikat, wsDataSertifikat, { origin: 'B4' });

    worksheetSertifikat['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetSertifikat[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetSertifikat, 'Sertifikat');

    /** ===================== Sheet 12: History ===================== */
    const wsDataHistory = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Status', 'Tanggal', 'Keterangan'],
      ...data.flatMap((item, index) => {
        if (!item.History || item.History.length === 0) {
          // If no History, return a single row with empty fields
          return [[
            index + 1,
            item.nomor_karyawan,
            `${item.firstname} ${item.lastname}`,
            '', '', ''
          ]];
        } 
         
        return item.History.map((hist) => ([
          index + 1,
          item.nomor_karyawan,
          `${item.firstname} ${item.lastname}`,
          hist.status_terakhir || '',
          hist.tanggal || '',
          hist.keterangan || '',
        ]));
      }),
    ];

    const worksheetHistory = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetHistory, [['Data History']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetHistory, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetHistory, wsDataHistory, { origin: 'B4' });

    worksheetHistory['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 6 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetHistory[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetHistory, 'History');

    /** ===================== Sheet 13: MCU ===================== */
    const wsDataMCU = [
      ['No', 'Nomor Karyawan', 'Nama Lengkap', 'Tanggal Pelaksanaan MCU', 'Tanggal MCU Berikutnya', 'Hasil MCU', 'Keterangan'],
      ...data.flatMap((item, index) => {
        if (!item.MCU || item.MCU.length === 0) {
          // If no MCU, return a single row with empty fields
          return [[
            index + 1,
            item.nomor_karyawan,
            `${item.firstname} ${item.lastname}`,
            '', '', ''
          ]];
        } 
         
        return item.MCU.map((mcu) => ([
          index + 1,
          item.nomor_karyawan,
          `${item.firstname} ${item.lastname}`,
          mcu.date_mcu || '',
          mcu.date_end_mcu || '',
          mcu.hasil_mcu || '',
          mcu.mcu || '',
        ]));
      }),
    ];

    const worksheetMCU = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheetMCU, [['Data MCU']], { origin: 'B1' });
    XLSX.utils.sheet_add_aoa(worksheetMCU, [[formattedNow]], { origin: 'B2' });
    XLSX.utils.sheet_add_aoa(worksheetMCU, wsDataMCU, { origin: 'B4' });

    worksheetMCU['!merges'] = [
      { s: { r: 0, c: 1 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 1 }, e: { r: 1, c: 7 } },
    ];

    ['B1', 'B2'].forEach((cell, i) => {
      worksheetMCU[cell].s = {
        font: { bold: true, sz: i === 0 ? 18 : 12 },
        alignment: { horizontal: 'center' },
      };
    });

    XLSX.utils.book_append_sheet(workbook, worksheetMCU, 'MCU');

    /** ===================== Export ===================== */
    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const filename = `Employee_${now.toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), filename);
  };

    
  return (
    <div>
      <ContentHeader className="mx-auto" title="Data Employee" />
      <div className="flex justify-between items-center w-full mb-4">
        <ButtonAction
          className="px-2"
          onClick={() => setIsFilterOpen(true)}
          icon={<Funnel size={24} />}
        >
          Filter
        </ButtonAction>
        <div className="flex gap-2">
          <ButtonAction type="button" 
          onClick={onSubmit}
          className="px-6">
            Export
          </ButtonAction> 
          <ButtonAction
            disabled={!createFlag}
            className={`px-2 ${!createFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => createFlag && router.push('/hr/employee/add/')}
            icon={<Plus size={24} />}
          >
            Buat Baru
          </ButtonAction>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FF3131] text-white text-center">
              <th className="px-4 py-2">No</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('nomor_karyawan')}>
                Employee ID {sortField === 'nomor_karyawan' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('firstname')}>
                Nama {sortField === 'firstname' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('department_id')}>
                Departemen {sortField === 'department_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('position_id')}>
                Position {sortField === 'position_id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('phone_number')}>
                Nomor Telpon {sortField === 'phone_number' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('level')}>
                Level {sortField === 'level' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th> 
            </tr>
          </thead>
          <tbody>
            {employeeList.length > 0 ? (
              employeeList.map((emp, index) => (
                <tr key={emp.ID} className="border-t text-center">
                  <td className="px-4 py-2 text-[#FF3131] underline cursor-pointer hover:font-bold"
                      onClick={() => router.push(`/hr/employee/detail/${emp.ID}`)}>
                    {(page - 1) * limit + index + 1}
                  </td>
                  <td className="px-4 py-2">{emp.nomor_karyawan}</td>
                  <td className="px-4 py-2 !text-start">{`${emp.firstname ?? ''} ${emp.lastname ?? ''}`.trim()}</td>
                  <td className="px-4 py-2">{emp.Department?.department_name}</td>
                  <td className="px-4 py-2">{emp.Position?.position_name}</td>
                  <td className="px-4 py-2">{emp.phone_number}</td>
                  <td className="px-4 py-2">{emp.email}</td>
                  <td className="px-4 py-2">{emp.level}</td>
                </tr>
              ))
            ) : (
              <tr>
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
              nomor_karyawan: values.nomor_karyawan?.toString() || '',
              department_id: values.department_id?.toString() || '',
              firstname: values.firstname?.toString() || '',
              position_id: values.position_id?.toString() || '',
              hire_by: values.hire_by?.toString() || '',
              agama: values.agama?.toString() || '',
              level: values.level?.toString() || '',
              gender: values.gender?.toString() || '',
              kategori_lokal_non_lokal: values.kategori_lokal_non_lokal?.toString() || '',
              kategori_triwulan: values.kategori_triwulan?.toString() || '',
              status: values.status?.toString() || '',
              kontrak: values.kontrak?.toString() || '',
              role_id: values.role_id?.toString() || '',
              code_emp: code_emp,
            });
            setPage(1); // reset to page 1
            setIsFilterOpen(false);
          }}
          onReset={() => {
            setFilters({
              nomor_karyawan: '',
              department_id: '',
              firstname: '',
              position_id: '',
              hire_by: '',
              agama: '',
              level: '',
              gender: '',
              kategori_lokal_non_lokal: '',
              kategori_triwulan: '',
              status: '',
              kontrak: '',
              role_id: '',
              code_emp: code_emp,
            });
            setPage(1);
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </div>
  );
}