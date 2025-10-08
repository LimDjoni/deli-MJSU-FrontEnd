import { EmployeeHomeFormValues } from "./EmployeeValues";

export type Asset = { 
	ID : number;
	asset_type : string;
	ukuran : string;
	stock : number;
} 

export type RangkumanAssetForm = {  
  month: Date | null;
};  

export type RangkumanAsset = {  
	asset_type : string;
	ukuran : string;
	stock : number; 
	jumlah_barang_masuk : number;
	jumlah_barang_keluar : number;
} 

export type BarangMasuk = { 
	ID : number;
	Asset : Asset;
	asset_type_id : string;
	tanggal : string | Date | null;
	jumlah_masuk : number;
} 

export type BarangMasukFilter = { 
	ID : number;
	asset_type_id : string;
	tanggal : Date | null;
	jumlah_masuk : number;
} 

export type BarangKeluar = { 
	ID : number;
	Asset : Asset;
	employee : EmployeeHomeFormValues;
  employee_id: number;
	asset_type_id : string;
	tanggal : string | Date | null;
	jumlah_keluar : number;
} 

export type BarangKeluarFilter = { 
	ID : number;
	asset_type_id : string;
  employee_id: string;
  department: string;
	tanggal : Date | null;
	jumlah_keluar : number;
} 

export type Option = {
  label: string;
  value: string;
};

// Define the array of options as a constant
export const assetTypeOptions: Option[] = [
{ label: 'APAR uk. 12kg', value: 'APAR uk. 12kg' },
{ label: 'APAR uk. 25kg', value: 'APAR uk. 25kg' },
{ label: 'APAR uk. 6kg', value: 'APAR uk. 6kg' },
{ label: 'APAR uk. 9kg', value: 'APAR uk. 9kg' },
{ label: 'Earplug', value: 'Earplug' },
{ label: 'Face Shield', value: 'Face Shield' },
{ label: 'Helm Biru', value: 'Helm Biru' },
{ label: 'Helm Hijau', value: 'Helm Hijau' },
{ label: 'Helm Kuning', value: 'Helm Kuning' },
{ label: 'Helm Merah', value: 'Helm Merah' },
{ label: 'Helm Putih', value: 'Helm Putih' },
{ label: 'Inner Helm/Harness Helm', value: 'Inner Helm/Harness Helm' },
{ label: 'Kacamata Hitam', value: 'Kacamata Hitam' },
{ label: 'Kacamata Putih', value: 'Kacamata Putih' },
{ label: 'Masker 3M', value: 'Masker 3M' },
{ label: 'Masker Medis', value: 'Masker Medis' },
{ label: 'Masker Respirator 3200', value: 'Masker Respirator 3200' },
{ label: 'Pelampung', value: 'Pelampung' },
{ label: 'Ring Bouy', value: 'Ring Bouy' },
{ label: 'Rompi Reflector', value: 'Rompi Reflector' },
{ label: 'Rompi Visitor', value: 'Rompi Visitor' },
{ label: 'Sarung Tangan (Biasa)', value: 'Sarung Tangan (Biasa)' },
{ label: 'Sarung Tangan Las', value: 'Sarung Tangan Las' },
{ label: 'Sepatu Boot Karet', value: 'Sepatu Boot Karet' },
{ label: 'Sepatu Safety', value: 'Sepatu Safety' },
];
 
export const ukuranOptions: Option[] = [
  { label: '39/5.5', value: '39/5.5' },
  { label: '40/6', value: '40/6' },
  { label: '41/7', value: '41/7' },
  { label: '42/8', value: '42/8' },
  { label: '43/9', value: '43/9' },
  { label: '44/9.5', value: '44/9.5' },
  { label: '45/10', value: '45/10' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'XXL', value: 'XXL' },
  { label: '-', value: '-' },
];