export type Option = {
  label: string;
  value: string;
};

// Define the array of options as a constant
export const sertifikatOptions: Option[] = [
  { label: 'License', value: 'License' },
  { label: 'Training', value: 'Training' },
];

export const ptOptions: Option[] = [
  { label: 'PT. BTP', value: 'PT. BTP' },
  { label: 'PT. TRIOP', value: 'PT. TRIOP' },
  { label: 'PT. MRP', value: 'PT. MRP' },
  { label: 'PT. MJSU', value: 'PT. MJSU' },
  { label: 'PT. IBS', value: 'PT. IBS' },
];

export const penempatanOptions: Option[] = [
  { label: 'Site Batapah', value: 'Site Batapah' },
  { label: 'Site Pepas', value: 'Site Pepas' }, 
  { label: 'Site Tarusan', value: 'Site Tarusan' }, 
  { label: 'Site Jetty Triop', value: 'Site Jetty Triop' }, 
];

export const kontrakOptions: Option[] = [
  { label: 'TKH', value: 'TKH' },
  { label: 'PKWT', value: 'PKWT' }, 
  { label: 'PKWTT', value: 'PKWTT' }, 
];

export const levelOptions: Option[] = [
  { label: 'Administrasi', value: 'Administrasi' },
  { label: 'Operasional', value: 'Operasional' },
  { label: 'Pengawas', value: 'Pengawas' },
]; 

export const genderOptions: Option[] = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
]; 

export const agamaOptions: Option[] = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katholik', value: 'Katholik' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Hindu', value: 'Hindu' },
]; 

export const golonganDarahOptions: Option[] = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
  { label: '-', value: '-' },
]; 

export const ringOptions: Option[] = [
  { label: 'RING I', value: 'RING I' },
  { label: 'RING II', value: 'RING II' },
  { label: 'RING III', value: 'RING III' },
  { label: 'LUAR RING', value: 'LUAR RING' },
]; 

export const hireOptions: Option[] = [
  { label: 'SITE', value: 'SITE' },
  { label: 'HEAD OFFICE', value: 'HEAD OFFICE' }, 
];

export const ringSerapanOptions: Option[] = [
  { label: 'LUAR RING', value: 'LUAR RING' },
  { label: 'RING PEPAS', value: 'RING PEPAS' },
  { label: 'RING TARUSAN', value: 'RING TARUSAN' },
  { label: 'RING BARSEL', value: 'RING BARSEL' },
  { label: 'RING BARUT', value: 'RING BARUT' },
  { label: 'RING BATAPAH', value: 'RING BATAPAH' },
  { label: 'RING DUSUN UTARA', value: 'RING DUSUN UTARA' },
  { label: 'RING TANJUNG JAWA', value: 'RING TANJUNG JAWA' },
  { label: 'RING PENDANG', value: 'RING PENDANG' },
  { label: 'RING PALANGKA RAYA', value: 'RING PALANGKA RAYA' },
  { label: 'RING BUHUT', value: 'RING BUHUT' },
  { label: 'RING BARITO TIMUR', value: 'RING BARITO TIMUR' }, 
]; 

export const LokalNonLokalOptions: Option[] = [
  { label: 'Lokal', value: 'Lokal' },
  { label: 'Non Lokal', value: 'Non Lokal' },
]; 

export const kategoriLaporanTriwulanOptions: Option[] = [
  { label: 'Management', value: 'Management' },
  { label: 'Professional', value: 'Professional' },
  { label: 'Teknis', value: 'Teknis' },
  { label: 'Administrasi', value: 'Administrasi' },
  { label: 'Terampil', value: 'Terampil' },  
  { label: 'Tidak Terampil', value: 'Tidak Terampil' },
];

export const pajakOptions: Option[] = [
  { label: 'K/0', value: 'K/0' }, 
  { label: 'K/1', value: 'K/1' },
  { label: 'K/2 ', value: 'K/2 ' }, 
  { label: 'K/3', value: 'K/3' }, 
  { label: 'K/4', value: 'K/4' }, 
  { label: 'TK', value: 'TK' }, 
  { label: 'TK/1', value: 'TK/1' },  
];

export const bankOptions: Option[] = [
  { label: 'Mandiri', value: 'Mandiri' },
  { label: 'BCA', value: 'BCA' }, 
  { label: 'BNI', value: 'BNI' }, 
  { label: 'BRI', value: 'BRI' }, 
  { label: 'BPD', value: 'BPD' }, 
];

export const statusOptions: Option[] = [
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Tidak Aktif', value: 'Tidak Aktif' },
];

export const statusTerakhirOptions: Option[] = [
  { label: 'Promosi', value: 'Promosi' },
  { label: 'Mutasi', value: 'Mutasi' },
  { label: 'Demosi', value: 'Demosi' },
  { label: 'Resign', value: 'Resign' },
  { label: 'Berakhir Kontrak', value: 'Berakhir Kontrak' },
  { label: 'PHK', value: 'PHK' },
]; 

export const hasilMCUOptions: Option[] = [
  { label: 'Fit', value: 'Fit' },
  { label: 'Fit With Note', value: 'Fit With Note' },
  { label: 'Un Fit', value: 'Un Fit' }, 
]; 

export const pendidikanOptions: Option[] = [
  { label: 'SD', value: 'SD' },
  { label: 'SMP', value: 'SMP' },
  { label: 'SMA', value: 'SMA' }, 
  { label: 'Diploma', value: 'Diploma' }, 
  { label: 'Sarjana', value: 'Sarjana' }, 
]; 

export const vendorOptions: Option[] = [
  { label: 'SADP', value: 'SADP' }, 
  { label: 'PPP', value: 'PPP' }, 
]; 

export const codeOptions: Option[] = [
  { label: 'B35', value: 'B35' }, 
  { label: 'B40', value: 'B40' }, 
]; 

export const tujuanAwalOptions: Option[] = [
  { label: 'MRP', value: 'MRP' }, 
  { label: 'MJSU', value: 'MJSU' }, 
]; 

export const componentOptions: Option[] = [
  { label: 'HYDRAULIC', value: 'HYDRAULIC' }, 
  { label: 'BRAKE', value: 'BRAKE' }, 
  { label: 'ATTACHMENT', value: 'ATTACHMENT' }, 
]; 

export const partDescriptionOptions: Option[] = [
  { label: 'HOSE', value: 'HOSE' }, 
  { label: 'EXHAUST BRAKE', value: 'EXHAUST BRAKE' }, 
  { label: 'BUCKET', value: 'BUCKET' }, 
]; 

export const statOptions: Option[] = [
  { label: 'PENDING', value: 'PENDING' }, 
  { label: 'OPEN', value: 'OPEN' }, 
  { label: 'CLOSED', value: 'CLOSED' }, 
  { label: 'CANCELLED', value: 'CANCELLED' }, 
  { label: 'REJECT', value: 'REJECT' }, 
]; 