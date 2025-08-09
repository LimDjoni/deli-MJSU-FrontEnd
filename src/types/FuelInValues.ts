export interface FuelIn {   
    ID: number;
	date: Date | string;
	vendor: string;
	code: string;
	nomor_surat_jalan: string;
	nomor_plat_mobil: string;
	qty: number;
	qty_now: number;
	driver: string;
	tujuan_awal: string;
}

export interface AdjustStock {   
    ID: number;
	date: Date | string;
	stock: number; 
}