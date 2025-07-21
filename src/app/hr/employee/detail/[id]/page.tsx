'use client';

import { useEffect, useState, use } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import { MrpAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import FilterModal from '@/components/Modal'; 
import DeleteForm from '@/components/DeleteForm';
import EmployeeTabDetails from './EmployeeTabDetails';
import { DOH, EmployeeAddDetailEditFormValue } from '@/types/EmployeeValues';
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

export default function DetailDataEmployeeForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<EmployeeAddDetailEditFormValue | null>(null);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuItems = useSelector((state: RootState) => state.sidebar.menuItems);

  const getUpdateFlag = (items: MenuItem[], targetPath: string): boolean => {
    for (const item of items) {
      if (item.path === targetPath) return item.update_flag ?? false;
      if (item.children) {
        const found = getUpdateFlag(item.children, targetPath);
        if (found) return true;
      }
    }
    return false;
  };

  const getDeleteFlag = (items: MenuItem[], targetPath: string): boolean => {
    for (const item of items) {
      if (item.path === targetPath) return item.delete_flag ?? false;
      if (item.children) {
        const found = getDeleteFlag(item.children, targetPath);
        if (found) return true;
      }
    }
    return false;
  };

const updateFlag = getUpdateFlag(menuItems, '/hr/employee');
const deleteFlag = getDeleteFlag(menuItems, '/hr/employee');
 
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/employee/detail/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // 🧠 Add masa_kontrak before setting detail
        if (Array.isArray(data.DOH)) {
          data.DOH = data.DOH.map((item: DOH) => {
            if (item.tanggal_doh && item.tanggal_end_doh) {
              const start = new Date(item.tanggal_doh);
              const end = new Date(item.tanggal_end_doh);

              // ➕ Add 1 day to end date
              end.setDate(end.getDate() + 1);

              const years = end.getFullYear() - start.getFullYear();
              const months = end.getMonth() - start.getMonth();
              const days = end.getDate() - start.getDate();

              const masa_kontrak = years * 12 + months + (days >= 0 ? 0 : -1);

              return {
                ...item,
                tanggal_end_doh_plus1: end.toISOString().split("T")[0], // Optional: keep new date as string
                masa_kontrak,
              };
            }

            return { ...item, masa_kontrak: null };
          });
        }
        
        setDetail(data);
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      }
    };

    if (token) {
      fetchDetail();
    }
  }, [token, id]);
  

  const handleDelete = async () => { 
    try {
      await MrpAPI({
        url: `/employee/delete/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      router.push("/hr/employee");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const onSubmit = () => {
    if (!detail) {
      console.error("Detail is null. Cannot export.");
      return;
    }

    const allData = detail;
    console.log(allData);

    exportEmployeeDetailToExcel(allData);
  };

  const exportEmployeeDetailToExcel = (data: EmployeeAddDetailEditFormValue) => {
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    const now = new Date();
    const formattedNow = `Export ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

    const wsData = [  
      ['DATA KARYAWAN'], // B3
      [formattedNow],    // B4
      [],

      // General Info
      ['Nomor Karyawan', ':', data.nomor_karyawan, '', '', 'Jabatan', ':', data.Position?.position_name],
      ['Nama Karyawan', ':', `${data.firstname} ${data.lastname}`, '', '', 'Nomor Telepon', ':', data.phone_number],
      ['Departemen', ':', data.Department?.department_name, '', '', 'Email Karyawan', ':', data.email],
      ['Date of Hire', ':', data.date_of_hire, '', '', 'Level', ':', data.Role.name],
      ['Hired By', ':', data.hire_by, '', '', 'Status Karyawan', ':', data.status],
      [],
      [],
      
      // Section: Kartu Keluarga
      ['Kartu Keluarga'],
      ['Nomor Kartu Keluarga', ':', data.KartuKeluarga.nomor_kartu_keluarga, '', '', 'Kontak Darurat', ':', data.KartuKeluarga.kontak_darurat],
      ['Nama Ibu Kandung', ':', data.KartuKeluarga.nama_ibu_kandung, '', '', 'Nama Kontak Darurat', ':', data.KartuKeluarga.nama_kontak_darurat],
      ['', '', '', '', '', 'Hubungan Kontak Darurat', ':', data.KartuKeluarga.hubungan_kontak_darurat],
      [],
      [],

      // Section: KTP
      ['KTP'],
      ['Nomor KTP', ':', data.KTP.nomor_ktp, '', '', 'Alamat', ':', data.KTP.alamat],
      ['Nama Sesuai KTP', ':', data.KTP.nama_sesuai_ktp, '', '', 'RT', ':', data.KTP.rt],
      ['Tempat Lahir', ':', data.KTP.tempat_lahir, '', '', 'RW', ':', data.KTP.rw],
      ['Tanggal Lahir', ':', data.KTP.tanggal_lahir, '', '', 'Kelurahan/Desa', ':', data.KTP.kelurahan],
      ['Gender', ':', data.KTP.gender, '', '', 'Kecamatan', ':', data.KTP.kecamatan],
      ['Golongan Darah', ':', data.KTP.golongan_darah, '', '', 'Kota/Kabupaten', ':', data.KTP.kota],
      ['Agama', ':', data.KTP.agama, '', '', 'Provinsi', ':', data.KTP.provinsi],
      ['Ring (KTP)', ':', data.KTP.ring_ktp, '', '', 'Kode Pos', ':', data.KTP.kode_pos],
      [],
      [],

      // Section: Pendidikan
      ['Pendidikan'],
      ['Jenjang Pendidikan', ':', data.Pendidikan.pendidikan_label],
      ['Pendidikan', ':', data.Pendidikan.pendidikan_terakhir],
      ['Jurusan', ':', data.Pendidikan.jurusan],
    ]; 

    const boldHeaders: string[] = ["B2", "B3", "B12", "B18", "B29", "B35"];

    let currentRow = 35; // After Pendidikan (Row 35 is safe start for dynamic sections)

    if (Array.isArray(data.DOH) && data.DOH.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, [["Kontrak"]], { origin: `B${currentRow}` });
      boldHeaders.push(`B${currentRow}`);
      currentRow++;
      XLSX.utils.sheet_add_aoa(worksheet, [["Tanggal DOH", "Tanggal End DOH", "Masa", "PT", "Penempatan", "Status Kontrak"]], { origin: `B${currentRow}` });
      currentRow++;

      data.DOH.forEach((item) => {
        const start = dayjs(item.tanggal_doh);
        const end = dayjs(item.tanggal_end_doh).add(1, 'day');
        const months = end.diff(start, 'month');

        const row = [
          item.tanggal_doh || '',
          item.tanggal_end_doh || '',
          `${months} Bulan`,
          item.pt || '',
          item.penempatan || '',
          item.status_kontrak || ''
        ];

        XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: `B${currentRow}` });
        currentRow++;
      });
    }

    currentRow += 2;

    if (Array.isArray(data.Sertifikat) && data.Sertifikat.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, [["Sertifikat"]], { origin: `B${currentRow}` });
      boldHeaders.push(`B${currentRow}`);
      currentRow++;
      XLSX.utils.sheet_add_aoa(worksheet, [["Jenis Sertifikat", "Keterangan", "Masa Berlaku"]], { origin: `B${currentRow}` });
      currentRow++;

      data.Sertifikat.forEach(item => {
        const row = [
          item.sertifikat || '',
          item.remark || '',
          item.date_effective || ''
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: `B${currentRow}` });
        currentRow++;
      });

      currentRow += 2;
    }

    // ✅ MCU Section
    if (Array.isArray(data.MCU) && data.MCU.length > 0) {
      XLSX.utils.sheet_add_aoa(worksheet, [["MCU"]], { origin: `B${currentRow}` });
      boldHeaders.push(`B${currentRow}`);
      currentRow++;
      XLSX.utils.sheet_add_aoa(worksheet, [["Tanggal Pelaksanaan MCU", "Tanggal MCU Berikutnya", "Hasil MCU", "Keterangan"]], { origin: `B${currentRow}` });
      currentRow++;

      data.MCU.forEach(item => {
        const row = [
          item.date_mcu || '',
          item.date_end_mcu || '',
          item.hasil_mcu || '',
          item.mcu || ''
        ];
        XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: `B${currentRow}` });
        currentRow++;
      });

      currentRow += 2;
    }

    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Laporan"],
      ["Ring Serapan", ":", data.Laporan?.ring_serapan || '', "", "", "Kategori Laporan Triwulan", ":", data.Laporan?.kategori_laporan_twiwulan || ''],
      ["Ring RIPPM", ":", data.Laporan?.ring_rippm || '', "", "", "Kategori Statistik K3", ":", data.level || ''],
      ["", "", "", "", "", "Kategori Lokal/Non Lokal", ":", data.Laporan?.kategori_lokal_non_lokal || ''],
      ["", "", "", "", "", "Rekomendasi", ":"],
      [],
      []
    ], { origin: `B${currentRow}` });
    boldHeaders.push(`B${currentRow}`);
    boldHeaders.push(`G${currentRow}`);

    currentRow += 7; // 4 rows + 2 empty rows

    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Pajak", "", "", "", "", "BPJS Kesehatan"],
      ["NPWP", ":", data.NPWP?.nomor_npwp || '', "", "", "Nomor BPJS Kesehatan", ":", data.BPJSKesehatan?.nomor_kesehatan || ''],
      ["Status Pajak", ":", data.NPWP?.status_pajak || ''],
      [],
      []
    ], { origin: `B${currentRow}` });
    boldHeaders.push(`B${currentRow}`);
  boldHeaders.push(`G${currentRow}`);

    currentRow += 5;

    XLSX.utils.sheet_add_aoa(worksheet, [
      ["Bank", "", "", "", "", "BPJS Ketenagakerjaan"],
      ["Nama Bank", ":", data.Bank?.nama_bank || '', "", "", "Nomor BPJS Ketenagakerjaan", ":", data.BPJSKetenagakerjaan?.nomor_ketenagakerjaan || ''],
      ["Nomor Rekening", ":", data.Bank?.nomor_rekening || ''],
      ["Nama Pemilik Bank", ":", data.Bank?.nama_pemilik_bank || ''],
      [],
      []
  ], { origin: `B${currentRow}` });
  boldHeaders.push(`B${currentRow}`);
  boldHeaders.push(`G${currentRow}`);

    currentRow += 6;

  XLSX.utils.sheet_add_aoa(worksheet, [
    ["APD"],
    ["Ukuran Baju", ":", data.APD?.ukuran_baju || ''],
    ["Ukuran Celana", ":", data.APD?.ukuran_celana || ''],
    ["Ukuran Sepatu", ":", data.APD?.ukuran_sepatu || ''],
    [],
    []
  ], { origin: `B${currentRow}` });  
  boldHeaders.push(`B${currentRow}`);

  currentRow += 6;

  if (Array.isArray(data.History) && data.History.length > 0) {
    XLSX.utils.sheet_add_aoa(worksheet, [["History"]], { origin: `B${currentRow}` });
    boldHeaders.push(`B${currentRow}`);
    currentRow++;
    XLSX.utils.sheet_add_aoa(worksheet, [["Tanggal", "Status", "Keterangan"]], { origin: `B${currentRow}` });
    currentRow++;

    data.History.forEach(item => {
      const row = [
        item.tanggal || '',
        item.status_terakhir || '',
        item.keterangan || '',
      ];
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: `B${currentRow}` });
      currentRow++;
    });

    currentRow += 2;
  }


    XLSX.utils.sheet_add_aoa(worksheet, wsData, { origin: 'B2' });

    boldHeaders.forEach(cellRef => {
    const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          font: { bold: true }
        };
      }
    });

    ["B2"].forEach(cellRef => {
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          font: {
            bold: true,
            sz: 18 
          },
          alignment: { horizontal: "center" } 
        };
      }
    });

    ["B3"].forEach(cellRef => {
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          font: {
            bold: true,
            sz: 11 
          },
          alignment: { horizontal: "center" } 
        };
      }
    });

    worksheet['!merges'] = [
      { s: { r: 1, c: 1 }, e: { r: 1, c: 8 } }, // DATA KARYAWAN title
      { s: { r: 2, c: 1 }, e: { r: 2, c: 8 } }, // Export date/time
      { s: { r: 11, c: 1 }, e: { r: 11, c: 8 } }, // Kartu Keluarga
      { s: { r: 17, c: 1 }, e: { r: 17, c: 8 } }, // KTP
      { s: { r: 28, c: 1 }, e: { r: 28, c: 8 } }, // Pendidikan
    ];

    // Optionally, define column widths
    worksheet['!cols'] = Array(10).fill({ wch: 20 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Karyawan');

    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const exportName = `Data_Karyawan_${now.toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), exportName);
  }; 


  return (
    <>
    <div className="relative mx-auto"> 
 
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Detail Data Employee" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/hr/employee/')}
            className="px-6">
              Kembali
            </ButtonDisabled>  
            <ButtonAction type="button" 
            onClick={onSubmit}
            className="px-6">
              Export
            </ButtonAction> 
            <ButtonAction type="button" 
              disabled={!deleteFlag}
              className={`px-6 ${!deleteFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => deleteFlag && setIsFilterOpen(true)}
            >
              Hapus
            </ButtonAction> 
            <ButtonAction type="submit" 
              disabled={!updateFlag}
              className={`px-6 ${!updateFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => updateFlag && router.push(`/hr/employee/edit/${id}`)}
            >
              Ubah
            </ButtonAction>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: 4 stacked fields */}
          <div className="space-y-4">
            <InputFieldsLabel
              label="Nomor Karyawan :"
              value={detail?.nomor_karyawan ?? ''}
              readOnly
            /> 
            <InputFieldsLabel
              label="Nomor Depan Karyawan :"
              value={detail?.firstname ?? ''}
              readOnly
            />  
            <InputFieldsLabel
              label="Nomor Belakang Karyawan :"
              value={detail?.lastname ?? ''}
              readOnly
            />   
            <InputFieldsLabel
              label="Department :"
              value={detail?.Department.department_name ?? ''}
              readOnly
            />    
            <InputFieldsLabel
              label="Date Of Hire :"
              value={detail?.date_of_hire as string ?? ''}
              readOnly
            />    
          </div>

          {/* Right column: 4 stacked fields */}
          <div className="space-y-4"> 
            <InputFieldsLabel
              label="Jabatan :"
              value={detail?.Position.position_name ?? ''}
              readOnly
            />     
              <InputFieldsLabel
              label="Nomor Telpon :"
              value={detail?.phone_number ?? ''}
              readOnly
            />     
              <InputFieldsLabel
              label="Email Karyawan :"
              value={detail?.email ?? ''}
              readOnly
            />     
              <InputFieldsLabel
              label="Level :"
              value={detail?.Role.name ?? ''}
              readOnly
            />      
          </div>
        </div> 
    </div> 
    
      <div className="mt-6">
        <EmployeeTabDetails data={detail as EmployeeAddDetailEditFormValue} 
          /> 
      </div>

     <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <DeleteForm
          onCancel={() => {  
            setIsFilterOpen(false);
          }}
          onConfirm={async () => {
            await handleDelete(); // ← perform deletion
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </>
  );
}
