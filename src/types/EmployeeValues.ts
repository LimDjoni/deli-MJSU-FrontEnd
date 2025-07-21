export type Position = {
  ID?: number;
  position_name : string;
  position_id: number;
}

export type Department = {
  ID: number; 
  department_name: string;
}

export type Role = {
  ID: number; 
  name: string;
}

export type KartuKeluarga = {
  ID: number; 
  nomor_kartu_keluarga: string;
  nama_ibu_kandung: string;
  kontak_darurat: string;
  nama_kontak_darurat: string;
  hubungan_kontak_darurat: string;
} 

export type KTP = {
  ID: number; 
  nama_sesuai_ktp: string;
  nomor_ktp: string;
  tempat_lahir: string;
  tanggal_lahir: Date | string | null;
  gender: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  golongan_darah: string;
  agama: string;
  ring_ktp: string;
}  

export type Pendidikan = {
  ID: number; 
  pendidikan_label: string;
  pendidikan_terakhir: string;
  jurusan: string; 
}  

export type DOH = {
  ID?: number;
  tanggal_doh: string | Date | null;
  tanggal_end_doh: string | Date | null;
  masa_kontrak: number | null;
  pt: string;
  penempatan: string; 
  status_kontrak: string;  
}
  
export type PositionOptions = {
  ID: number; 
  position_id: number;
  position_name: string;
}
 
export type Sertifikat = {
  ID?: number;
  date_effective : string | Date | null;
  sertifikat: string;
  remark: string;
}

export type MCU = {
  ID?: number;
  date_mcu : string | Date | null;
  date_end_mcu : string | Date | null;
  hasil_mcu: string;
  mcu: string;
}

export type APD = {
  ID: number;
  ukuran_baju : string;
  ukuran_celana: string;
  ukuran_sepatu: string;
}

export type Laporan = {
  ID: number; 
  ring_serapan: string;
  ring_rippm: string;
  kategori_laporan_twiwulan: string;
  kategori_lokal_non_lokal: string;
  rekomendasi: string;
} 
 
export type NPWP = {
  ID: number;
  nomor_npwp : string;
  status_pajak: string;
}

export type Bank = {
  ID: number;
  nama_bank : string;
  nomor_rekening: string;
  nama_pemilik_bank: string;
}

export type BPJSKesehatan = {
  ID: number; 
  nomor_kesehatan?: string; 
}

export type BPJSKetenagakerjaan = {
  ID: number; 
  nomor_ketenagakerjaan?: string; 
}

export type History = {
  ID?: number; 
  tanggal: string | Date | null;
  status_terakhir: string; 
  keterangan: string; 
  }

export type EmployeeHomeFormValues = {   
  ID: number; 
  nomor_karyawan: string;
  department_id: number;
  firstname: string;
  lastname: string;
  phone_number: string;
  email: string;
  level: string;
  Department: Department;
  Position: Position;
}
 
export type EmployeeAddDetailEditFormValue = {
  ID: number; 
  nomor_karyawan: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  email: string;
  level: string;
  department_id: number;
  Department: Department;
  status: string;
  hire_by: string;
  role_id: number; // ✅ tambahkan ini
  position_id: number; // ✅ tambahkan ini
  date_of_hire: string | Date | null;
  Role: Role;
  KartuKeluarga: KartuKeluarga;
  KTP: KTP;
  Pendidikan: Pendidikan; 
  DOH: DOH[]; 
  Sertifikat: Sertifikat[];
  MCU: MCU[];
  Laporan: Laporan;
  APD: APD;
  NPWP: NPWP;
  Bank: Bank;
  BPJSKesehatan: BPJSKesehatan;
  BPJSKetenagakerjaan: BPJSKetenagakerjaan;
  History: History[];
  Position: Position;
}
 
export type SubmittedDOH = { 
  ID?: number;
  tanggal_doh: string | Date | null;
  tanggal_end_doh: string | Date | null;
  masa_kontrak: number | null;
  pt: string;
  penempatan: string; 
  status_kontrak: string; 
};
  
export type SubmittedSertifikat = {
  ID?: number; 
  sertifikat: string;
  date_effective: string | Date | null;
  remark: string;
};

export type SubmittedMCU = {
  ID?: number; 
  mcu: string;
  date_mcu: string | Date | null;
  date_end_mcu : string | Date | null;
  hasil_mcu: string;
};

export type SubmittedHistory = {
  ID?: number; 
  status_terakhir: string;
  tanggal: string | Date | null;
  keterangan: string;
};
